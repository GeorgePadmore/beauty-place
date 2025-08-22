import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Like, Between, MoreThanOrEqual, LessThanOrEqual, In, IsNull, Not } from 'typeorm';
import { Professional, ProfessionalStatus } from '../../professionals/entities/professional.entity';
import { Service } from '../../services/entities/service.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';
import { Availability, AvailabilityStatus } from '../../availability/entities/availability.entity';
import { User } from '../../users/entities/user.entity';
import { 
  SearchProfessionalsDto, 
  SearchServicesDto, 
  ProfessionalSearchResultDto, 
  ServiceSearchResultDto,
  CombinedSearchResultDto 
} from '../dto';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Search professionals with advanced filtering and location-based search
   */
  async searchProfessionals(searchDto: SearchProfessionalsDto): Promise<ProfessionalSearchResultDto> {
    this.logger.debug('Starting professional search...', 'SearchService');

    const {
      query,
      serviceCategory,
      status,
      minRating,
      maxPrice,
      minPrice,
      latitude,
      longitude,
      radius = 50,
      featured,
      premium,
      availableToday,
      availableDate,
      availableTime,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = searchDto;

    // Build base query
    let queryBuilder = this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .leftJoinAndSelect('professional.services', 'services')
      .leftJoinAndSelect('professional.availabilities', 'availabilities')
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.isActive = :isActive', { isActive: true });

    // Apply text search
    if (query) {
      queryBuilder = this.applyTextSearch(queryBuilder, query);
    }

    // Apply service category filter
    if (serviceCategory) {
      queryBuilder = queryBuilder.andWhere('services.category = :category', { category: serviceCategory });
    }

    // Apply status filter
    if (status) {
      queryBuilder = queryBuilder.andWhere('professional.status = :status', { status });
    }

    // Apply rating filter
    if (minRating) {
      queryBuilder = queryBuilder.andWhere('professional.averageRating >= :minRating', { minRating });
    }

    // Apply price filters
    if (minPrice || maxPrice) {
      queryBuilder = this.applyPriceFilters(queryBuilder, minPrice, maxPrice);
    }

    // Apply featured/premium filters
    if (featured !== undefined) {
      queryBuilder = queryBuilder.andWhere('professional.isFeatured = :featured', { featured });
    }

    if (premium !== undefined) {
      queryBuilder = queryBuilder.andWhere('professional.isPremium = :premium', { premium });
    }

    // Apply availability filters
    if (availableToday || availableDate || availableTime) {
      queryBuilder = this.applyAvailabilityFilters(queryBuilder, availableToday, availableDate, availableTime);
    }

    // Apply location-based search
    if (latitude && longitude) {
      queryBuilder = this.applyLocationSearch(queryBuilder, latitude, longitude, radius);
    }

    // Apply sorting
    queryBuilder = this.applySorting(queryBuilder, sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(offset).take(limit);

    // Execute query
    const [professionals, total] = await queryBuilder.getManyAndCount();

    // Calculate distances if location search was used
    let distances: Array<{ professionalId: string; distance: number; unit: 'km' }> | undefined;
    if (latitude && longitude) {
      distances = professionals.map(professional => ({
        professionalId: professional.id,
        distance: this.calculateDistance(latitude, longitude, professional.latitude, professional.longitude),
        unit: 'km' as const
      }));
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    this.logger.success(`Professional search completed: ${professionals.length} results`, 'SearchService');

    return {
      total,
      page,
      limit,
      totalPages,
      hasMore,
      query,
      filters: this.extractFilters(searchDto),
      sorting: { field: sortBy, order: sortOrder },
      location: latitude && longitude ? { latitude, longitude, radius } : undefined,
      professionals,
      distances,
    };
  }

  /**
   * Search services with advanced filtering
   */
  async searchServices(searchDto: SearchServicesDto): Promise<ServiceSearchResultDto> {
    this.logger.debug('Starting service search...', 'SearchService');

    const {
      query,
      category,
      professionalId,
      maxPrice,
      minPrice,
      minRating,
      featured,
      active = true,
      latitude,
      longitude,
      radius = 50,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = searchDto;

    // Build base query
    let queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('service.isDeleted = :isDeleted', { isDeleted: false });

    // Apply text search
    if (query) {
      queryBuilder = queryBuilder.andWhere(
        '(service.serviceName ILIKE :query OR service.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Apply category filter
    if (category) {
      queryBuilder = queryBuilder.andWhere('service.category = :category', { category });
    }

    // Apply professional filter
    if (professionalId) {
      queryBuilder = queryBuilder.andWhere('service.professionalId = :professionalId', { professionalId });
    }

    // Apply price filters
    if (minPrice || maxPrice) {
      if (minPrice) {
        queryBuilder = queryBuilder.andWhere('service.basePrice >= :minPrice', { minPrice });
      }
      if (maxPrice) {
        queryBuilder = queryBuilder.andWhere('service.basePrice <= :maxPrice', { maxPrice });
      }
    }

    // Apply rating filter
    if (minRating) {
      queryBuilder = queryBuilder.andWhere('service.averageRating >= :minRating', { minRating });
    }

    // Apply featured filter
    if (featured !== undefined) {
      queryBuilder = queryBuilder.andWhere('service.isFeatured = :featured', { featured });
    }

    // Apply active filter
    if (active !== undefined) {
      if (active) {
        queryBuilder = queryBuilder.andWhere('service.status = :status', { status: 'active' });
      } else {
        queryBuilder = queryBuilder.andWhere('service.status != :status', { status: 'active' });
      }
    }

    // Apply location-based search
    if (latitude && longitude) {
      queryBuilder = this.applyLocationSearch(queryBuilder, latitude, longitude, radius);
    }

    // Apply sorting
    queryBuilder = this.applySorting(queryBuilder, sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(offset).take(limit);

    // Execute query
    const [services, total] = await queryBuilder.getManyAndCount();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    this.logger.success(`Service search completed: ${services.length} results`, 'SearchService');

    return {
      total,
      page,
      limit,
      totalPages,
      hasMore,
      query,
      filters: this.extractFilters(searchDto),
      sorting: { field: sortBy, order: sortOrder },
      location: latitude && longitude ? { latitude, longitude, radius } : undefined,
      services,
      professionals: services.map(service => ({
        serviceId: service.id,
        professional: service.professional,
      })),
    };
  }

  /**
   * Combined search for both professionals and services
   */
  async combinedSearch(searchDto: SearchProfessionalsDto): Promise<CombinedSearchResultDto> {
    this.logger.debug('Starting combined search...', 'SearchService');

    const [professionalResults, serviceResults] = await Promise.all([
      this.searchProfessionals(searchDto),
      this.searchServices({
        ...searchDto,
        // Remove professional-specific filters for service search
        featured: undefined,
        // Map professional sortBy to service sortBy
        sortBy: searchDto.sortBy === 'distance' ? 'relevance' : 
                searchDto.sortBy === 'experience' ? 'relevance' : 
                searchDto.sortBy,
      }),
    ]);

    return {
      ...professionalResults,
      services: serviceResults.services,
      professionals: professionalResults.professionals,
      distances: professionalResults.distances,
    };
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<{
    professionals: Array<{ id: string; name: string; businessName: string }>;
    services: Array<{ id: string; name: string; category: string }>;
    categories: string[];
  }> {
    if (!query || query.length < 2) {
      return { professionals: [], services: [], categories: [] };
    }

    const [professionals, services] = await Promise.all([
      this.professionalRepository
        .createQueryBuilder('professional')
        .leftJoinAndSelect('professional.user', 'user')
        .where('user.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .andWhere(
          '(professional.businessName ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query)',
          { query: `%${query}%` }
        )
        .select(['professional.id', 'professional.businessName', 'user.firstName', 'user.lastName'])
        .limit(limit)
        .getMany(),

      this.serviceRepository
        .createQueryBuilder('service')
        .where('service.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('service.status = :status', { status: 'active' })
        .andWhere('service.serviceName ILIKE :query', { query: `%${query}%` })
        .select(['service.id', 'service.serviceName', 'service.category'])
        .limit(limit)
        .getMany(),
    ]);

    const categories = [...new Set(services.map(s => s.category))];

    return {
      professionals: professionals.map(p => ({
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        businessName: p.businessName,
      })),
      services: services.map(s => ({
        id: s.id,
        name: s.serviceName,
        category: s.category,
      })),
      categories,
    };
  }

  // Private helper methods

  private applyTextSearch(queryBuilder: SelectQueryBuilder<any>, query: string): SelectQueryBuilder<any> {
    return queryBuilder.andWhere(
      '(professional.businessName ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query OR services.serviceName ILIKE :query)',
      { query: `%${query}%` }
    );
  }

  private applyPriceFilters(queryBuilder: SelectQueryBuilder<any>, minPrice?: number, maxPrice?: number): SelectQueryBuilder<any> {
    if (minPrice) {
      queryBuilder = queryBuilder.andWhere('CAST(services.base_price AS DECIMAL) >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.andWhere('CAST(services.base_price AS DECIMAL) <= :maxPrice', { maxPrice });
    }
    return queryBuilder;
  }

  private applyAvailabilityFilters(
    queryBuilder: SelectQueryBuilder<any>,
    availableToday?: boolean,
    availableDate?: string,
    availableTime?: string
  ): SelectQueryBuilder<any> {
    if (availableToday) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      queryBuilder = queryBuilder.andWhere(
        '(availabilities.dayOfWeek = :dayOfWeek OR availabilities.date = :today)',
        { dayOfWeek, today: today.toISOString().split('T')[0] }
      );
    }

    if (availableDate) {
      const date = new Date(availableDate);
      const dayOfWeek = date.getDay();
      queryBuilder = queryBuilder.andWhere(
        '(availabilities.dayOfWeek = :dayOfWeek OR availabilities.date = :date)',
        { dayOfWeek, date: availableDate }
      );
    }

    if (availableTime) {
      queryBuilder = queryBuilder.andWhere(
        'availabilities.startTime <= :time AND availabilities.endTime >= :time',
        { time: availableTime }
      );
    }

    return queryBuilder;
  }

  private applyLocationSearch(
    queryBuilder: SelectQueryBuilder<any>,
    latitude: number,
    longitude: number,
    radius: number
  ): SelectQueryBuilder<any> {
    // Only apply location search if coordinates are provided and valid
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      // Calculate bounding box for efficient location search
      const latDelta = radius / 111.32; // 1 degree latitude ≈ 111.32 km
      const lonDelta = radius / (111.32 * Math.cos(latitude * Math.PI / 180));
      
      queryBuilder = queryBuilder
        .andWhere('professional.latitude IS NOT NULL')
        .andWhere('professional.longitude IS NOT NULL')
        .andWhere('professional.latitude BETWEEN :minLat AND :maxLat', {
          minLat: latitude - latDelta,
          maxLat: latitude + latDelta,
        })
        .andWhere('professional.longitude BETWEEN :minLon AND :maxLon', {
          minLon: longitude - lonDelta,
          maxLon: longitude + lonDelta,
        });
    }
    return queryBuilder;
  }

  private applySorting(queryBuilder: SelectQueryBuilder<any>, sortBy: string, sortOrder: 'asc' | 'desc'): SelectQueryBuilder<any> {
    const typeormOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    
    switch (sortBy) {
      case 'rating':
        queryBuilder = queryBuilder.orderBy('professional.averageRating', typeormOrder);
        break;
      case 'price':
        queryBuilder = queryBuilder.orderBy('services.basePrice', typeormOrder);
        break;
      case 'distance':
        // Distance sorting is handled after query execution
        break;
      case 'experience':
        queryBuilder = queryBuilder.orderBy('professional.yearsOfExperience', typeormOrder);
        break;
      case 'relevance':
      default:
        // Default relevance sorting (text search relevance + rating)
        queryBuilder = queryBuilder.orderBy('professional.averageRating', 'DESC');
        break;
    }

    return queryBuilder;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private extractFilters(searchDto: any): Record<string, any> {
    const filters: Record<string, any> = {};
    
    Object.keys(searchDto).forEach(key => {
      if (searchDto[key] !== undefined && !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) {
        filters[key] = searchDto[key];
      }
    });

    return filters;
  }
}
