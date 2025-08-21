import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not } from 'typeorm';
import { Service, ServiceStatus } from '../entities/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { ServiceResponseDto } from '../dto/service-response.dto';
import { Professional } from '../../professionals/entities/professional.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    // Validate that the professional exists
    const professional = await this.professionalRepository.findOne({
      where: { id: createServiceDto.professionalId, isDeleted: false }
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    // Check if service with same name already exists for this professional
    const existingService = await this.serviceRepository.findOne({
      where: { 
        professionalId: createServiceDto.professionalId, 
        serviceName: createServiceDto.serviceName,
        isDeleted: false 
      }
    });

    if (existingService) {
      throw new ConflictException('Service with this name already exists for this professional');
    }

    // Create the service
    const service = this.serviceRepository.create({
      ...createServiceDto,
      status: createServiceDto.status || ServiceStatus.DRAFT,
      currency: createServiceDto.currency || 'USD',
    });

    const savedService = await this.serviceRepository.save(service);
    return this.mapToResponseDto(savedService, professional);
  }

  async findAll(
    professionalId?: string,
    category?: string,
    status?: ServiceStatus,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ServiceResponseDto[]> {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .where('service.isDeleted = :isDeleted', { isDeleted: false });

    if (professionalId) {
      queryBuilder.andWhere('service.professionalId = :professionalId', { professionalId });
    }

    if (category) {
      queryBuilder.andWhere('service.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('service.status = :status', { status });
    }

    const services = await queryBuilder
      .orderBy('service.isFeatured', 'DESC')
      .addOrderBy('service.averageRating', 'DESC')
      .addOrderBy('service.totalBookings', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return Promise.all(
      services.map(service => this.mapToResponseDto(service, service.professional))
    );
  }

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .where('service.id = :id', { id })
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.mapToResponseDto(service, service.professional);
  }

  async findByProfessionalId(professionalId: string): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .where('service.professionalId = :professionalId', { professionalId })
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('service.isFeatured', 'DESC')
      .addOrderBy('service.averageRating', 'DESC')
      .getMany();

    return Promise.all(
      services.map(service => this.mapToResponseDto(service, service.professional))
    );
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if service name is being updated and if it conflicts with existing service
    if (updateServiceDto.serviceName && updateServiceDto.serviceName !== service.serviceName) {
      const existingService = await this.serviceRepository.findOne({
        where: { 
          professionalId: service.professionalId, 
          serviceName: updateServiceDto.serviceName,
          isDeleted: false,
          id: Not(id) // Exclude current service
        }
      });

      if (existingService) {
        throw new ConflictException('Service with this name already exists for this professional');
      }
    }

    // Update the service
    Object.assign(service, updateServiceDto);
    const updatedService = await this.serviceRepository.save(service);

    return this.mapToResponseDto(updatedService, updatedService.professional);
  }

  async remove(id: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Soft delete
    service.isDeleted = true;
    await this.serviceRepository.save(service);
  }

  async updateStatus(id: string, status: ServiceStatus): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.status = status;
    const updatedService = await this.serviceRepository.save(service);

    return this.mapToResponseDto(updatedService, updatedService.professional);
  }

  async toggleFeatured(id: string, isFeatured: boolean, featuredUntil?: Date): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.isFeatured = isFeatured;
    if (featuredUntil) {
      service.featuredUntil = featuredUntil;
    } else if (!isFeatured) {
      service.featuredUntil = null;
    }

    const updatedService = await this.serviceRepository.save(service);
    return this.mapToResponseDto(updatedService, updatedService.professional);
  }

  async searchServices(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    maxDuration?: number,
    location?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ServiceResponseDto[]> {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .where('service.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('service.status = :status', { status: ServiceStatus.ACTIVE });

    if (category) {
      queryBuilder.andWhere('service.category = :category', { category });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('service.basePrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('service.basePrice <= :maxPrice', { maxPrice });
    }

    if (maxDuration !== undefined) {
      queryBuilder.andWhere('service.durationMinutes <= :maxDuration', { maxDuration });
    }

    if (location) {
      // This would need to be implemented based on how location is stored
      // For now, we'll search in professional service areas
      queryBuilder.andWhere(
        'professional.serviceAreas @> :location',
        { location: JSON.stringify([{ city: location }]) }
      );
    }

    const services = await queryBuilder
      .orderBy('service.isFeatured', 'DESC')
      .addOrderBy('service.averageRating', 'DESC')
      .addOrderBy('service.totalBookings', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return Promise.all(
      services.map(service => this.mapToResponseDto(service, service.professional))
    );
  }

  async getFeaturedServices(limit: number = 10): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .where('service.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('service.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('service.status = :status', { status: ServiceStatus.ACTIVE })
      .orderBy('service.averageRating', 'DESC')
      .limit(limit)
      .getMany();

    return Promise.all(
      services.map(service => this.mapToResponseDto(service, service.professional))
    );
  }

  async updateRating(id: string, newRating: number): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (newRating < 1 || newRating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const totalRating = service.averageRating * service.totalReviews + newRating;
    service.totalReviews += 1;
    service.averageRating = totalRating / service.totalReviews;

    const updatedService = await this.serviceRepository.save(service);
    return this.mapToResponseDto(updatedService, updatedService.professional);
  }

  async updateCompletionRate(id: string, completed: boolean): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['professional']
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (completed) {
      service.totalBookings += 1;
      // This is a simplified calculation - in practice, you'd track completed vs total
      service.completionRate = 95.0; // Placeholder
    }

    const updatedService = await this.serviceRepository.save(service);
    return this.mapToResponseDto(updatedService, updatedService.professional);
  }

  private mapToResponseDto(service: Service, professional: Professional): ServiceResponseDto {
    const responseDto = new ServiceResponseDto();
    
    // Map all service fields
    Object.assign(responseDto, service);
    
    // Add computed properties
    responseDto.isAvailable = service.isAvailable();
    responseDto.canAcceptBookings = service.canAcceptBookings();
    responseDto.finalPrice = service.getFinalPrice();
    
    // Add professional information
    if (professional) {
      responseDto.professionalBusinessName = professional.businessName;
      responseDto.professionalTitle = professional.professionalTitle;
      responseDto.professionalCategory = professional.category;
      responseDto.professionalAverageRating = professional.averageRating;
    }

    return responseDto;
  }
}
