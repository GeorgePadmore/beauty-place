import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In, Not } from 'typeorm';
import { Availability, AvailabilityStatus, DayOfWeek } from '../entities/availability.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dto';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    private readonly logger: LoggerService,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto, userId: string): Promise<AvailabilityResponseDto> {
    // Validate professional exists
    const professional = await this.professionalRepository.findOne({
      where: { id: createAvailabilityDto.professionalId, isDeleted: false }
    });
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    // Validate time format and logic
    this.validateTimeLogic(createAvailabilityDto);

    // Check for overlapping availability
    if (createAvailabilityDto.isRecurring) {
      await this.checkOverlappingRecurring(createAvailabilityDto);
    } else if (createAvailabilityDto.date) {
      await this.checkOverlappingSpecificDate(createAvailabilityDto);
    }

    // Create availability
    const availability = this.availabilityRepository.create({
      ...createAvailabilityDto,
      createdBy: userId,
      currentBookings: 0,
    });

    const savedAvailability = await this.availabilityRepository.save(availability);
    return this.mapToResponseDto(savedAvailability, professional);
  }

  async findAll(): Promise<AvailabilityResponseDto[]> {
    const availabilities = await this.availabilityRepository.find({
      where: { isDeleted: false },
      relations: ['professional'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    return availabilities.map(availability => 
      this.mapToResponseDto(availability, availability.professional)
    );
  }

  async findOne(id: string): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    return this.mapToResponseDto(availability, availability.professional);
  }

  async findByProfessional(
    professionalId: string, 
    requestingUserId?: string, 
    requestingUserRole?: string
  ): Promise<AvailabilityResponseDto[]> {
    const availabilities = await this.availabilityRepository.find({
      where: { professionalId, isDeleted: false },
      relations: ['professional'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    // Check if the requesting user owns this professional profile
    let isOwner = false;
    if (requestingUserId) {
      const professional = await this.professionalRepository.findOne({
        where: { id: professionalId, isDeleted: false }
      });
      isOwner = professional ? professional.userId === requestingUserId : false;
    }

    // If user is the owner (professional) or admin, show all availability with full details
    if (isOwner || requestingUserRole === 'administrator') {
      return availabilities.map(availability => 
        this.mapToResponseDto(availability, availability.professional)
      );
    }

    // Otherwise, show public availability (filtered and limited details)
    return availabilities
      .filter(availability => availability.isAvailable && availability.status === 'available')
      .map(availability => this.mapToPublicResponseDto(availability, availability.professional));
  }

  async findByDateRange(professionalId: string, startDate: Date, endDate: Date): Promise<AvailabilityResponseDto[]> {
    const availabilities = await this.availabilityRepository.find({
      where: [
        // Recurring availabilities
        { 
          professionalId, 
          isRecurring: true, 
          isDeleted: false 
        },
        // Specific date availabilities within range
        {
          professionalId,
          isRecurring: false,
          date: Between(startDate, endDate),
          isDeleted: false
        }
      ],
      relations: ['professional'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    return availabilities.map(availability => 
      this.mapToResponseDto(availability, availability.professional)
    );
  }

  async findAvailableSlots(professionalId: string, date: Date, serviceDurationMinutes: number): Promise<AvailabilityResponseDto[]> {
    const dayOfWeek = date.getDay();
    
    const availabilities = await this.availabilityRepository.find({
      where: [
        // Recurring availability for this day
        { 
          professionalId, 
          dayOfWeek, 
          isRecurring: true, 
          isDeleted: false,
          isAvailable: true,
          status: AvailabilityStatus.AVAILABLE
        },
        // Specific date availability
        {
          professionalId,
          date,
          isRecurring: false,
          isDeleted: false,
          isAvailable: true,
          status: AvailabilityStatus.AVAILABLE
        }
      ],
      relations: ['professional'],
      order: { startTime: 'ASC' }
    });

    // Filter by service duration and current bookings
    return availabilities
      .filter(availability => {
        const availableDuration = availability.availableDurationMinutes;
        return availableDuration >= serviceDurationMinutes && availability.canAcceptBooking();
      })
      .map(availability => this.mapToResponseDto(availability, availability.professional));
  }

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    // Validate time logic if times are being updated
    if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
      const validationData = {
        ...availability,
        ...updateAvailabilityDto
      };
      this.validateTimeLogic(validationData);
    }

    // Check for overlapping availability if times or dates are being updated
    if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime || updateAvailabilityDto.date || updateAvailabilityDto.dayOfWeek) {
      if (availability.isRecurring) {
        await this.checkOverlappingRecurring({ ...availability, ...updateAvailabilityDto });
      } else if (updateAvailabilityDto.date || availability.date) {
        await this.checkOverlappingSpecificDate({ ...availability, ...updateAvailabilityDto });
      }
    }

    // Update availability
    Object.assign(availability, updateAvailabilityDto);
    const updatedAvailability = await this.availabilityRepository.save(availability);

    return this.mapToResponseDto(updatedAvailability, availability.professional);
  }

  async remove(id: string): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    // Soft delete
    availability.isDeleted = true;
    await this.availabilityRepository.save(availability);
  }

  async updateStatus(id: string, status: AvailabilityStatus): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    availability.status = status;
    const updatedAvailability = await this.availabilityRepository.save(availability);

    return this.mapToResponseDto(updatedAvailability, availability.professional);
  }

  async toggleActive(id: string): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    availability.isActive = !availability.isActive;
    const updatedAvailability = await this.availabilityRepository.save(availability);

    return this.mapToResponseDto(updatedAvailability, availability.professional);
  }

  async updateCurrentBookings(id: string, change: number): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    const newCount = availability.currentBookings + change;
    if (newCount < 0) {
      throw new BadRequestException('Current bookings cannot be negative');
    }

    if (availability.maxBookings && newCount > availability.maxBookings) {
      throw new BadRequestException('Current bookings cannot exceed maximum bookings');
    }

    availability.currentBookings = newCount;
    const updatedAvailability = await this.availabilityRepository.save(availability);

    return this.mapToResponseDto(updatedAvailability, availability.professional);
  }

  async getWeeklySchedule(professionalId: string): Promise<AvailabilityResponseDto[]> {
    const availabilities = await this.availabilityRepository.find({
      where: { 
        professionalId, 
        isRecurring: true, 
        isDeleted: false 
      },
      relations: ['professional'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    return availabilities.map(availability => 
      this.mapToResponseDto(availability, availability.professional)
    );
  }

  private validateTimeLogic(data: any): void {
    const startTime = this.parseTime(data.startTime);
    const endTime = this.parseTime(data.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (data.breakStartTime && data.breakEndTime) {
      const breakStart = this.parseTime(data.breakStartTime);
      const breakEnd = this.parseTime(data.breakEndTime);

      if (breakStart >= breakEnd) {
        throw new BadRequestException('Break start time must be before break end time');
      }

      if (breakStart < startTime || breakEnd > endTime) {
        throw new BadRequestException('Break time must be within availability time range');
      }
    }
  }

  private async checkOverlappingRecurring(data: any): Promise<void> {
    const existing = await this.availabilityRepository.find({
      where: {
        professionalId: data.professionalId,
        dayOfWeek: data.dayOfWeek,
        isRecurring: true,
        isDeleted: false,
        id: data.id ? Not(data.id) : undefined
      }
    });

    for (const existingAvailability of existing) {
      if (this.timesOverlap(data.startTime, data.endTime, existingAvailability.startTime, existingAvailability.endTime)) {
        throw new ConflictException('Overlapping availability found for this day and time');
      }
    }
  }

  private async checkOverlappingSpecificDate(data: any): Promise<void> {
    if (!data.date) return;

    const existing = await this.availabilityRepository.find({
      where: {
        professionalId: data.professionalId,
        date: data.date,
        isRecurring: false,
        isDeleted: false,
        id: data.id ? Not(data.id) : undefined
      }
    });

    for (const existingAvailability of existing) {
      if (this.timesOverlap(data.startTime, data.endTime, existingAvailability.startTime, existingAvailability.endTime)) {
        throw new ConflictException('Overlapping availability found for this date and time');
      }
    }
  }

  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.parseTime(start1);
    const e1 = this.parseTime(end1);
    const s2 = this.parseTime(start2);
    const e2 = this.parseTime(end2);

    return s1 < e2 && s2 < e1;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private mapToResponseDto(availability: Availability, professional: Professional): AvailabilityResponseDto {
    return {
      id: availability.id,
      professionalId: availability.professionalId,
      dayOfWeek: availability.dayOfWeek,
      dayName: availability.dayName,
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      status: availability.status,
      isAvailable: availability.isAvailable,
      isRecurring: availability.isRecurring,
      breakStartTime: availability.breakStartTime,
      breakEndTime: availability.breakEndTime,
      maxBookings: availability.maxBookings,
      currentBookings: availability.currentBookings,
      advanceBookingHours: availability.advanceBookingHours,
      notes: availability.notes,
      durationMinutes: availability.durationMinutes,
      durationHours: availability.durationHours,
      breakDurationMinutes: availability.breakDurationMinutes,
      availableDurationMinutes: availability.availableDurationMinutes,
      canAcceptBooking: availability.canAcceptBooking(),
      isActive: availability.isActive,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
      professionalBusinessName: professional.businessName,
      professionalTitle: professional.professionalTitle,
      professionalCategory: professional.category,
    };
  }

  private mapToPublicResponseDto(availability: Availability, professional: Professional): AvailabilityResponseDto {
    return {
      id: availability.id,
      professionalId: availability.professionalId,
      dayOfWeek: availability.dayOfWeek,
      dayName: availability.dayName,
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      status: availability.status,
      isAvailable: availability.isAvailable,
      isRecurring: availability.isRecurring,
      breakStartTime: undefined, // Hide break details from public
      breakEndTime: undefined,   // Hide break details from public
      maxBookings: undefined,    // Hide booking capacity from public
      currentBookings: undefined, // Hide current bookings from public
      advanceBookingHours: undefined, // Hide advance booking hours from public
      notes: undefined,          // Hide internal notes from public
      durationMinutes: availability.durationMinutes,
      durationHours: availability.durationHours,
      breakDurationMinutes: undefined, // Hide break duration from public
      availableDurationMinutes: availability.availableDurationMinutes,
      canAcceptBooking: availability.canAcceptBooking(),
      isActive: availability.isActive,
      createdAt: undefined,      // Hide creation date from public
      updatedAt: undefined,      // Hide update date from public
      professionalBusinessName: professional.businessName,
      professionalTitle: professional.professionalTitle,
      professionalCategory: professional.category,
    };
  }
}
