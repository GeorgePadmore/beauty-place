import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Professional, ProfessionalStatus, VerificationStatus } from '../entities/professional.entity';
import { CreateProfessionalDto } from '../dto/create-professional.dto';
import { UpdateProfessionalDto } from '../dto/update-professional.dto';
import { ProfessionalResponseDto } from '../dto/professional-response.dto';
import { User, UserRole } from '../../users/entities/user.entity';
import { ServiceAccount } from '../../payments/entities/service-account.entity';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ServiceAccount)
    private readonly serviceAccountRepository: Repository<ServiceAccount>,
  ) {}

  async create(createProfessionalDto: CreateProfessionalDto): Promise<ProfessionalResponseDto> {
    // Validate that the user exists and is a professional
    const user = await this.userRepository.findOne({
      where: { id: createProfessionalDto.userId, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PROFESSIONAL) {
      throw new BadRequestException('User must have professional role');
    }

    // Check if professional profile already exists for this user
    const existingProfessional = await this.professionalRepository.findOne({
      where: { userId: createProfessionalDto.userId, isDeleted: false }
    });

    if (existingProfessional) {
      throw new ConflictException('Professional profile already exists for this user');
    }

    // Create the professional profile
    const professional = this.professionalRepository.create({
      ...createProfessionalDto,
      status: createProfessionalDto.status || ProfessionalStatus.PENDING,
      verificationStatus: VerificationStatus.UNVERIFIED,
    });

    const savedProfessional = await this.professionalRepository.save(professional);

    // Create associated service account
    await this.createServiceAccount(savedProfessional.id);

    return this.mapToResponseDto(savedProfessional, user);
  }

  async findAll(
    status?: ProfessionalStatus,
    category?: string,
    location?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ProfessionalResponseDto[]> {
    const queryBuilder = this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.isDeleted = :isDeleted', { isDeleted: false });

    if (status) {
      queryBuilder.andWhere('professional.status = :status', { status });
    }

    if (category) {
      queryBuilder.andWhere('professional.category = :category', { category });
    }

    if (location) {
      queryBuilder.andWhere(
        'professional.serviceAreas @> :location',
        { location: JSON.stringify([{ city: location }]) }
      );
    }

    const professionals = await queryBuilder
      .orderBy('professional.isFeatured', 'DESC')
      .addOrderBy('professional.averageRating', 'DESC')
      .addOrderBy('professional.totalReviews', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return Promise.all(
      professionals.map(professional => this.mapToResponseDto(professional, professional.user))
    );
  }

  async findOne(id: string): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.id = :id', { id })
      .andWhere('professional.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    return this.mapToResponseDto(professional, professional.user);
  }

  async findByUserId(userId: string): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.userId = :userId', { userId })
      .andWhere('professional.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!professional) {
      throw new NotFoundException('Professional profile not found for this user');
    }

    return this.mapToResponseDto(professional, professional.user);
  }

  async update(id: string, updateProfessionalDto: UpdateProfessionalDto): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    // Update the professional profile
    Object.assign(professional, updateProfessionalDto);
    const updatedProfessional = await this.professionalRepository.save(professional);

    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async remove(id: string): Promise<void> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    // Soft delete
    professional.isDeleted = true;
    await this.professionalRepository.save(professional);
  }

  async updateStatus(id: string, status: ProfessionalStatus, notes?: string): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    professional.status = status;
    
    if (status === ProfessionalStatus.ACTIVE && professional.verificationStatus === VerificationStatus.UNVERIFIED) {
      professional.verificationStatus = VerificationStatus.PENDING;
    }

    if (notes) {
      professional.verificationNotes = notes;
    }

    const updatedProfessional = await this.professionalRepository.save(professional);
    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async updateVerificationStatus(
    id: string, 
    verificationStatus: VerificationStatus, 
    notes?: string
  ): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    professional.verificationStatus = verificationStatus;
    
    if (verificationStatus === VerificationStatus.VERIFIED) {
      professional.verificationDate = new Date();
      if (professional.status === ProfessionalStatus.PENDING) {
        professional.status = ProfessionalStatus.ACTIVE;
      }
    }

    if (notes) {
      professional.verificationNotes = notes;
    }

    const updatedProfessional = await this.professionalRepository.save(professional);
    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async toggleFeatured(id: string, isFeatured: boolean, featuredUntil?: Date): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    professional.isFeatured = isFeatured;
    if (featuredUntil) {
      professional.featuredUntil = featuredUntil;
    } else if (!isFeatured) {
      professional.featuredUntil = null;
    }

    const updatedProfessional = await this.professionalRepository.save(professional);
    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async togglePremium(id: string, isPremium: boolean, premiumUntil?: Date): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    professional.isPremium = isPremium;
    if (premiumUntil) {
      professional.premiumUntil = premiumUntil;
    } else if (!isPremium) {
      professional.premiumUntil = null;
    }

    const updatedProfessional = await this.professionalRepository.save(professional);
    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async updateRating(id: string, newRating: number): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    if (newRating < 1 || newRating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    professional.updateRating(newRating);
    const updatedProfessional = await this.professionalRepository.save(professional);
    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async updateCompletionRate(id: string, completed: boolean): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user']
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    professional.updateCompletionRate(completed);
    const updatedProfessional = await this.professionalRepository.save(professional);
    return this.mapToResponseDto(updatedProfessional, updatedProfessional.user);
  }

  async searchProfessionals(
    location?: string,
    category?: string,
    minRating?: number,
    maxTravelDistance?: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ProfessionalResponseDto[]> {
    const queryBuilder = this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('professional.status = :status', { status: ProfessionalStatus.ACTIVE })
      .andWhere('professional.verificationStatus = :verificationStatus', { verificationStatus: VerificationStatus.VERIFIED });

    if (category) {
      queryBuilder.andWhere('professional.category = :category', { category });
    }

    if (minRating) {
      queryBuilder.andWhere('professional.averageRating >= :minRating', { minRating });
    }

    if (maxTravelDistance) {
      queryBuilder.andWhere('professional.maxTravelDistance <= :maxTravelDistance', { maxTravelDistance });
    }

    if (location) {
      queryBuilder.andWhere(
        'professional.serviceAreas @> :location',
        { location: JSON.stringify([{ city: location }]) }
      );
    }

    const professionals = await queryBuilder
      .orderBy('professional.isFeatured', 'DESC')
      .addOrderBy('professional.averageRating', 'DESC')
      .addOrderBy('professional.totalReviews', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return Promise.all(
      professionals.map(professional => this.mapToResponseDto(professional, professional.user))
    );
  }

  async getFeaturedProfessionals(limit: number = 10): Promise<ProfessionalResponseDto[]> {
    const professionals = await this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('professional.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('professional.status = :status', { status: ProfessionalStatus.ACTIVE })
      .andWhere('professional.verificationStatus = :verificationStatus', { verificationStatus: VerificationStatus.VERIFIED })
      .orderBy('professional.averageRating', 'DESC')
      .limit(limit)
      .getMany();

    return Promise.all(
      professionals.map(professional => this.mapToResponseDto(professional, professional.user))
    );
  }

  private async createServiceAccount(professionalId: string): Promise<void> {
    const serviceAccount = this.serviceAccountRepository.create({
      professionalId,
      grossBalance: 0,
      netBalance: 0,
    });

    await this.serviceAccountRepository.save(serviceAccount);
  }

  private mapToResponseDto(professional: Professional, user: User): ProfessionalResponseDto {
    const responseDto = new ProfessionalResponseDto();
    
    // Map all professional fields
    Object.assign(responseDto, professional);
    
    // Add computed properties
    responseDto.isAvailable = professional.isAvailable();
    responseDto.canAcceptBookings = professional.canAcceptBookings();
    
    // Add user information
    if (user) {
      responseDto.userEmail = user.email;
      responseDto.userFirstName = user.firstName;
      responseDto.userLastName = user.lastName;
      responseDto.userPhone = user.phone;
    }

    return responseDto;
  }
}
