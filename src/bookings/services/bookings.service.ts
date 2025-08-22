import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, Not, IsNull } from 'typeorm';
import { Booking, BookingStatus, PaymentStatus, BookingType } from '../entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { Service } from '../../services/entities/service.entity';
import { Availability, AvailabilityStatus } from '../../availability/entities/availability.entity';
import { CreateBookingDto, UpdateBookingDto, BookingResponseDto } from '../dto';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    private readonly logger: LoggerService,
  ) {}

  async create(createBookingDto: CreateBookingDto, clientId: string): Promise<BookingResponseDto> {
    this.logger.debug('1. Starting booking creation...', 'BookingsService');
    
    // Validate client exists
    const client = await this.userRepository.findOne({ where: { id: clientId, isDeleted: false } });
    if (!client) {
      this.logger.error('Client not found', undefined, 'BookingsService');
      throw new NotFoundException('Client not found');
    }
    this.logger.success(`2. Client validated: ${client.id}`, 'BookingsService');

    // Validate professional exists
    const professional = await this.professionalRepository.findOne({ where: { id: createBookingDto.professionalId, isDeleted: false } });
    if (!professional) {
      this.logger.error('Professional not found', undefined, 'BookingsService');
      throw new NotFoundException('Professional not found');
    }
    this.logger.success(`3. Professional validated: ${professional.id}`, 'BookingsService');

    // Validate service exists and belongs to professional
    const service = await this.serviceRepository.findOne({ where: { id: createBookingDto.serviceId, isDeleted: false } });
    if (!service || service.professionalId !== createBookingDto.professionalId) {
      this.logger.error('Service validation failed', undefined, 'BookingsService');
      throw new NotFoundException('Service not found or does not belong to the specified professional');
    }
    this.logger.success(`4. Service validated: ${service.id}`, 'BookingsService');

    // Convert dates
    const startTime = new Date(createBookingDto.startTime);
    const endTime = createBookingDto.endTime ? new Date(createBookingDto.endTime) : this.calculateEndTime(startTime, service.durationMinutes);
    this.logger.debug(`5. Dates converted: ${startTime} - ${endTime}`, 'BookingsService');

    // Check double booking
    this.logger.debug('6. Checking double booking...', 'BookingsService');
    await this.checkDoubleBooking(createBookingDto.professionalId, startTime, endTime);
    this.logger.success('7. Double booking check passed', 'BookingsService');

    // Check availability
    this.logger.debug('8. Checking availability...', 'BookingsService');
    await this.checkAvailability(createBookingDto.professionalId, startTime, service.durationMinutes);
    this.logger.success('9. Availability check passed', 'BookingsService');

    // Check advance booking hours
    this.logger.debug('10. Checking advance booking hours...', 'BookingsService');
    const advanceBookingHours = 24; // 24 hours in advance
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + advanceBookingHours * 60 * 60 * 1000);
    
    if (startTime < minBookingTime) {
      this.logger.error('Advance booking hours not met', undefined, 'BookingsService');
      throw new BadRequestException(`Bookings must be made at least ${advanceBookingHours} hours in advance`);
    }
    this.logger.success('11. Advance booking hours check passed', 'BookingsService');

    // Calculate pricing
    this.logger.debug('12. Calculating pricing...', 'BookingsService');
    const { servicePrice, travelFee, platformFee, totalPrice } = await this.calculatePricing(
      service,
      professional,
      createBookingDto.bookingType || BookingType.IN_PERSON,
      createBookingDto.location
    );
    this.logger.debug(`13. Pricing calculated: ${servicePrice}, ${travelFee}, ${platformFee}, ${totalPrice}`, 'BookingsService');

    // Create booking
    this.logger.debug('14. Creating booking object...', 'BookingsService');
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      clientId,
      endTime,
      servicePriceCents: Math.round(servicePrice * 100),
      travelFeeCents: Math.round(travelFee * 100),
      platformFeeCents: Math.round(platformFee * 100),
      totalPriceCents: Math.round(totalPrice * 100),
      discountCents: createBookingDto.discountCents || 0,
      idempotencyKey: createBookingDto.idempotencyKey || uuidv4(),
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });
    this.logger.success(`15. Booking object created: ${booking.id}`, 'BookingsService');

    // Save booking to database
    this.logger.debug('16. Saving booking to database...', 'BookingsService');
    const savedBooking = await this.bookingRepository.save(booking);
    this.logger.success(`17. Booking saved to database: ${savedBooking.id}`, 'BookingsService');

    // Update availability bookings count
    this.logger.debug('18. Updating availability bookings count...', 'BookingsService');
    await this.updateAvailabilityBookings(createBookingDto.professionalId, startTime, 1);
    this.logger.success('19. Availability updated', 'BookingsService');

    // Map to response DTO
    this.logger.debug('20. Mapping to response DTO...', 'BookingsService');
    const response = this.mapToResponseDto(savedBooking, client, professional, service);
    this.logger.success('21. Response mapped successfully', 'BookingsService');

    this.logger.success('22. Booking creation completed successfully!', 'BookingsService');
    return response;
  }

  async findAll(): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.find({
      where: { isDeleted: false },
      relations: ['client', 'professional', 'service'],
      order: { startTime: 'DESC' }
    });

    return bookings.map(booking => 
      this.mapToResponseDto(booking, booking.client, booking.professional, booking.service)
    );
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['client', 'professional', 'service']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.mapToResponseDto(booking, booking.client, booking.professional, booking.service);
  }

  async findByClient(clientId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.find({
      where: { clientId, isDeleted: false },
      relations: ['client', 'professional', 'service'],
      order: { startTime: 'DESC' }
    });

    return bookings.map(booking => 
      this.mapToResponseDto(booking, booking.client, booking.professional, booking.service)
    );
  }

  async findByProfessional(professionalId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.find({
      where: { professionalId, isDeleted: false },
      relations: ['client', 'professional', 'service'],
      order: { startTime: 'DESC' }
    });

    return bookings.map(booking => 
      this.mapToResponseDto(booking, booking.client, booking.professional, booking.service)
    );
  }

  async findUpcomingBookings(userId: string, isProfessional: boolean = false): Promise<BookingResponseDto[]> {
    const whereClause = isProfessional 
      ? { professionalId: userId, isDeleted: false }
      : { clientId: userId, isDeleted: false };

    const bookings = await this.bookingRepository.find({
      where: {
        ...whereClause,
        startTime: MoreThan(new Date()),
        status: BookingStatus.CONFIRMED
      },
      relations: ['client', 'professional', 'service'],
      order: { startTime: 'ASC' }
    });

    return bookings.map(booking => 
      this.mapToResponseDto(booking, booking.client, booking.professional, booking.service)
    );
  }

  async findTodayBookings(userId: string, isProfessional: boolean = false): Promise<BookingResponseDto[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const whereClause = isProfessional 
      ? { professionalId: userId, isDeleted: false }
      : { clientId: userId, isDeleted: false };

    const bookings = await this.bookingRepository.find({
      where: {
        ...whereClause,
        startTime: Between(startOfDay, endOfDay),
        status: Not(BookingStatus.CANCELLED)
      },
      relations: ['client', 'professional', 'service'],
      order: { startTime: 'ASC' }
    });

    return bookings.map(booking => 
      this.mapToResponseDto(booking, booking.client, booking.professional, booking.service)
    );
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['client', 'professional', 'service']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Validate time changes if updating start time
    if (updateBookingDto.startTime) {
      const newStartTime = new Date(updateBookingDto.startTime);
      await this.checkDoubleBooking(booking.professionalId, newStartTime, updateBookingDto.endTime ? new Date(updateBookingDto.endTime) : booking.endTime, id);
      await this.checkAvailability(booking.professionalId, newStartTime, booking.service.durationMinutes);
    }

    // Update booking
    Object.assign(booking, updateBookingDto);
    
    // Recalculate end time if start time changed
    if (updateBookingDto.startTime && !updateBookingDto.endTime) {
      const newStartTime = new Date(updateBookingDto.startTime);
      booking.endTime = this.calculateEndTime(newStartTime, booking.service.durationMinutes);
    }

    // Recalculate pricing if needed
    if (updateBookingDto.startTime || updateBookingDto.location || updateBookingDto.bookingType) {
      const { servicePrice, travelFee, platformFee, totalPrice } = await this.calculatePricing(
        booking.service,
        booking.professional,
        updateBookingDto.bookingType || booking.bookingType,
        updateBookingDto.location || booking.location
      );
      
      booking.servicePriceCents = Math.round(servicePrice * 100);
      booking.travelFeeCents = Math.round(travelFee * 100);
      booking.platformFeeCents = Math.round(platformFee * 100);
      booking.totalPriceCents = Math.round(totalPrice * 100) - (updateBookingDto.discountCents || booking.discountCents);
    }

    const updatedBooking = await this.bookingRepository.save(booking);

    return this.mapToResponseDto(updatedBooking, updatedBooking.client, updatedBooking.professional, updatedBooking.service);
  }

  async updateStatus(id: string, status: BookingStatus, userId: string, notes?: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['client', 'professional', 'service']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Validate status transition
    this.validateStatusTransition(booking.status, status, userId === booking.professionalId);

    // Update status and related fields
    booking.status = status;
    
    if (status === BookingStatus.CANCELLED) {
      booking.cancelledBy = userId;
      booking.cancelledAt = new Date();
      if (notes) booking.cancellationReason = notes;
      
      // Update availability current bookings count
      await this.updateAvailabilityBookings(booking.professionalId, booking.startTime, -1);
    } else if (status === BookingStatus.COMPLETED) {
      booking.completedAt = new Date();
      if (notes) booking.professionalNotes = notes;
    } else if (status === BookingStatus.CONFIRMED) {
      booking.confirmationSentAt = new Date();
      if (notes) booking.professionalNotes = notes;
    }

    const updatedBooking = await this.bookingRepository.save(booking);

    return this.mapToResponseDto(updatedBooking, updatedBooking.client, updatedBooking.professional, updatedBooking.service);
  }

  async reschedule(id: string, newStartTime: Date, userId: string, notes?: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['client', 'professional', 'service']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new ForbiddenException('You can only reschedule your own bookings');
    }

    if (!booking.canBeRescheduled()) {
      throw new BadRequestException('This booking cannot be rescheduled');
    }

    // Check availability for new time
    await this.checkAvailability(booking.professionalId, newStartTime, booking.service.durationMinutes);
    await this.checkDoubleBooking(booking.professionalId, newStartTime, this.calculateEndTime(newStartTime, booking.service.durationMinutes), id);

    // Create new booking
    const newBooking = this.bookingRepository.create({
      ...booking,
      id: undefined,
      startTime: newStartTime,
      endTime: this.calculateEndTime(newStartTime, booking.service.durationMinutes),
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      rescheduledFrom: booking.id,
      rescheduledAt: new Date(),
      rescheduledBy: userId,
      professionalNotes: notes || `Rescheduled from ${booking.startTime.toISOString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedNewBooking = await this.bookingRepository.save(newBooking);

    // Update original booking
    booking.status = BookingStatus.RESCHEDULED;
    booking.rescheduledTo = savedNewBooking.id;
    booking.rescheduledAt = new Date();
    booking.rescheduledBy = userId;
    await this.bookingRepository.save(booking);

    // Update availability bookings count
    await this.updateAvailabilityBookings(booking.professionalId, booking.startTime, -1);
    await this.updateAvailabilityBookings(booking.professionalId, newStartTime, 1);

    return this.mapToResponseDto(savedNewBooking, savedNewBooking.client, savedNewBooking.professional, savedNewBooking.service);
  }

  async addReview(id: string, rating: number, review: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['client', 'professional', 'service']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('Only the client can add reviews');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    if (booking.rating) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    booking.rating = rating;
    booking.review = review;
    booking.reviewedAt = new Date();

    const updatedBooking = await this.bookingRepository.save(booking);

    // Update service and professional ratings
    await this.updateServiceRating(booking.serviceId, rating);
    await this.updateProfessionalRating(booking.professionalId);

    return this.mapToResponseDto(updatedBooking, updatedBooking.client, updatedBooking.professional, updatedBooking.service);
  }

  async remove(id: string, userId: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    // Soft delete
    booking.isDeleted = true;
    await this.bookingRepository.save(booking);
  }

  // Private helper methods
  private async checkDoubleBooking(professionalId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<void> {
    const whereClause: any = {
      professionalId,
      isDeleted: false,
      status: Not(BookingStatus.CANCELLED),
      id: excludeId ? Not(excludeId) : undefined
    };

    const conflictingBookings = await this.bookingRepository.find({
      where: [
        { ...whereClause, startTime: Between(startTime, endTime) },
        { ...whereClause, endTime: Between(startTime, endTime) },
        { ...whereClause, startTime: LessThan(startTime), endTime: MoreThan(endTime) }
      ]
    });

    if (conflictingBookings.length > 0) {
      throw new ConflictException('This time slot is already booked');
    }
  }

  private async checkAvailability(professionalId: string, startTime: Date, serviceDurationMinutes: number): Promise<void> {
    const dayOfWeek = startTime.getDay();
    const timeString = startTime.toTimeString().slice(0, 5);

    const availability = await this.availabilityRepository.findOne({
      where: [
        {
          professionalId,
          dayOfWeek,
          isRecurring: true,
          isDeleted: false,
          isAvailable: true,
          status: AvailabilityStatus.AVAILABLE
        },
        {
          professionalId,
          date: startTime,
          isRecurring: false,
          isDeleted: false,
          isAvailable: true,
          status: AvailabilityStatus.AVAILABLE
        }
      ]
    });

    if (!availability) {
      throw new BadRequestException('Professional is not available at this time');
    }

    if (!availability.isTimeInRange(timeString)) {
      throw new BadRequestException('Booking time is outside available hours');
    }

    if (availability.maxBookings && availability.currentBookings >= availability.maxBookings) {
      throw new BadRequestException('Maximum bookings reached for this time slot');
    }

    if (availability.advanceBookingHours) {
      const hoursInAdvance = (startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      if (hoursInAdvance < availability.advanceBookingHours) {
        throw new BadRequestException(`Bookings must be made at least ${availability.advanceBookingHours} hours in advance`);
      }
    }
  }

  private calculateEndTime(startTime: Date, durationMinutes: number): Date {
    return new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  }

  private async calculatePricing(service: Service, professional: Professional, bookingType: BookingType, location?: any): Promise<{
    servicePrice: number;
    travelFee: number;
    platformFee: number;
    totalPrice: number;
  }> {
    // Ensure all values are numbers
    let servicePrice = Number(service.discountedPrice || service.basePrice);
    let travelFee = 0;

    // Calculate travel fee for home visits
    if (bookingType === BookingType.HOME_VISIT && location) {
      // This is a simplified calculation - in production you'd use a real distance API
      travelFee = Number(professional.baseTravelFee || 0);
    }

    // Calculate platform fee (simplified - in production you'd get this from PricingConfig)
    const platformFeePercentage = 0.10; // 10%
    const platformFee = (servicePrice + travelFee) * platformFeePercentage;

    const totalPrice = servicePrice + travelFee + platformFee;

    return { servicePrice, travelFee, platformFee, totalPrice };
  }

  private async updateAvailabilityBookings(professionalId: string, startTime: Date, change: number): Promise<void> {
    const dayOfWeek = startTime.getDay();
    const timeString = startTime.toTimeString().slice(0, 5);

    const availability = await this.availabilityRepository.findOne({
      where: [
        {
          professionalId,
          dayOfWeek,
          isRecurring: true,
          isDeleted: false
        },
        {
          professionalId,
          date: startTime,
          isRecurring: false,
          isDeleted: false
        }
      ]
    });

    if (availability) {
      availability.currentBookings = Math.max(0, availability.currentBookings + change);
      await this.availabilityRepository.save(availability);
    }
  }

  private validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus, isProfessional: boolean): void {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.NO_SHOW]: [],
      [BookingStatus.RESCHEDULED]: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Only professionals can mark as completed or no-show
    if ((newStatus === BookingStatus.COMPLETED || newStatus === BookingStatus.NO_SHOW) && !isProfessional) {
      throw new ForbiddenException('Only professionals can mark bookings as completed or no-show');
    }
  }

  private async updateServiceRating(serviceId: string, rating: number): Promise<void> {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (service) {
      const totalRating = (service.averageRating * service.totalReviews) + rating;
      const newTotalReviews = service.totalReviews + 1;
      service.averageRating = totalRating / newTotalReviews;
      service.totalReviews = newTotalReviews;
      await this.serviceRepository.save(service);
    }
  }

  private async updateProfessionalRating(professionalId: string): Promise<void> {
    const professional = await this.professionalRepository.findOne({ where: { id: professionalId } });
    if (professional) {
      const bookings = await this.bookingRepository.find({
        where: { professionalId, rating: Not(IsNull()), isDeleted: false }
      });

      if (bookings.length > 0) {
        const totalRating = bookings.reduce((sum, booking) => sum + booking.rating, 0);
        professional.averageRating = totalRating / bookings.length;
        professional.totalReviews = bookings.length;
        await this.professionalRepository.save(professional);
      }
    }
  }

  private mapToResponseDto(booking: Booking, client: User, professional: Professional, service: Service): BookingResponseDto {
    this.logger.debug('mapToResponseDto - Starting...', 'BookingsService');
    this.logger.debug(`mapToResponseDto - booking object: ${booking?.id}, startTime: ${typeof booking?.startTime}, endTime: ${typeof booking?.endTime}`, 'BookingsService');
    this.logger.debug(`mapToResponseDto - client: ${client?.id}, professional: ${professional?.id}, service: ${service?.id}`, 'BookingsService');

    try {
      this.logger.debug('mapToResponseDto - Creating response object...', 'BookingsService');
      
      // Ensure startTime and endTime are Date objects on the booking object
      if (!(booking.startTime instanceof Date)) {
        booking.startTime = new Date(booking.startTime);
      }
      if (!(booking.endTime instanceof Date)) {
        booking.endTime = new Date(booking.endTime);
      }
      
      this.logger.debug(`mapToResponseDto - Date conversion: startTime=${typeof booking.startTime}, endTime=${typeof booking.endTime}`, 'BookingsService');
      
      const response = {
        id: booking.id,
        clientId: booking.clientId,
        professionalId: booking.professionalId,
        serviceId: booking.serviceId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        servicePrice: booking.servicePrice,
        travelFee: booking.travelFee,
        platformFee: booking.platformFee,
        discount: booking.discount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bookingType: booking.bookingType,
        stripePaymentIntentId: booking.stripePaymentIntentId,
        idempotencyKey: booking.idempotencyKey,
        location: booking.location,
        clientNotes: booking.clientNotes,
        professionalNotes: booking.professionalNotes,
        cancellationReason: booking.cancellationReason,
        cancelledBy: booking.cancelledBy,
        cancelledAt: booking.cancelledAt,
        confirmationSentAt: booking.confirmationSentAt,
        reminderSentAt: booking.reminderSentAt,
        completedAt: booking.completedAt,
        rating: booking.rating,
        review: booking.review,
        reviewedAt: booking.reviewedAt,
        rescheduledFrom: booking.rescheduledFrom,
        rescheduledTo: booking.rescheduledTo,
        rescheduledAt: booking.rescheduledAt,
        rescheduledBy: booking.rescheduledBy,
        durationMinutes: booking.durationMinutes,
        durationHours: booking.durationHours,
        isActive: booking.isActive,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        isConfirmed: booking.isConfirmed(),
        isPending: booking.isPending(),
        isCancelled: booking.isCancelled(),
        isCompleted: booking.isCompleted(),
        isRescheduled: booking.isRescheduled(),
        isNoShow: booking.isNoShow(),
        canBeCancelled: booking.canBeCancelled(),
        canBeRescheduled: booking.canBeRescheduled(),
        canBeCompleted: booking.canBeCompleted(),
        isPaid: booking.isPaid(),
        isPaymentPending: booking.isPaymentPending(),
        isPaymentFailed: booking.isPaymentFailed(),
        hasRefund: booking.hasRefund(),
        isUpcoming: booking.isUpcoming(),
        isPast: booking.isPast(),
        isToday: booking.isToday(),
        timeUntilStart: booking.getTimeUntilStart(),
        timeUntilStartMinutes: booking.getTimeUntilStartMinutes(),
        timeUntilStartHours: booking.getTimeUntilStartHours(),
        clientEmail: client.email,
        clientFullName: `${client.firstName} ${client.lastName}`,
        professionalBusinessName: professional.businessName,
        professionalTitle: professional.professionalTitle,
        serviceName: service.serviceName,
        serviceCategory: service.category,
      };

      this.logger.success('mapToResponseDto - Response object created successfully', 'BookingsService');
      return response;
    } catch (error) {
      this.logger.error('mapToResponseDto - Error occurred', error.stack, 'BookingsService');
      throw error;
    }
  }
}
