import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { 
  SearchProfessionalsDto, 
  SearchServicesDto, 
  ProfessionalSearchResultDto, 
  ServiceSearchResultDto,
  CombinedSearchResultDto 
} from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { LoggerService } from '../../common/services/logger.service';

@ApiTags('Search & Discovery')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly logger: LoggerService,
  ) {}

  @Public()
  @Get('professionals')
  @ApiOperation({
    summary: 'Search professionals',
    description: 'Advanced search for professionals with comprehensive filtering, location-based search, and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Professionals found successfully',
    type: ProfessionalSearchResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters'
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search query for professional name, business name, or services' })
  @ApiQuery({ name: 'serviceCategory', required: false, enum: ['HAIR_STYLING', 'MAKEUP', 'NAIL_ART', 'FACIAL_TREATMENT', 'MASSAGE', 'SKIN_CARE', 'BODY_TREATMENT', 'OTHER'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'VERIFIED'] })
  @ApiQuery({ name: 'minRating', required: false, description: 'Minimum rating filter (1-5)' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price filter in cents' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price filter in cents' })
  @ApiQuery({ name: 'latitude', required: false, description: 'Latitude for location-based search' })
  @ApiQuery({ name: 'longitude', required: false, description: 'Longitude for location-based search' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in kilometers (default: 50)' })
  @ApiQuery({ name: 'featured', required: false, description: 'Filter by featured professionals only' })
  @ApiQuery({ name: 'premium', required: false, description: 'Filter by premium professionals only' })
  @ApiQuery({ name: 'availableToday', required: false, description: 'Filter by professionals available today' })
  @ApiQuery({ name: 'availableDate', required: false, description: 'Filter by professionals available on specific date (ISO string)' })
  @ApiQuery({ name: 'availableTime', required: false, description: 'Filter by professionals available at specific time (HH:MM)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['rating', 'price', 'distance', 'relevance', 'experience'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page (default: 20, max: 100)' })
  async searchProfessionals(@Query() searchDto: SearchProfessionalsDto): Promise<ProfessionalSearchResultDto> {
    this.logger.debug('Professional search request received', 'SearchController');
    return this.searchService.searchProfessionals(searchDto);
  }

  @Public()
  @Get('services')
  @ApiOperation({
    summary: 'Search services',
    description: 'Advanced search for services with comprehensive filtering, location-based search, and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Services found successfully',
    type: ServiceSearchResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters'
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search query for service name or description' })
  @ApiQuery({ name: 'category', required: false, enum: ['HAIR_STYLING', 'MAKEUP', 'NAIL_ART', 'FACIAL_TREATMENT', 'MASSAGE', 'SKIN_CARE', 'BODY_TREATMENT', 'OTHER'] })
  @ApiQuery({ name: 'professionalId', required: false, description: 'Filter by specific professional' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price filter in cents' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price filter in cents' })
  @ApiQuery({ name: 'minRating', required: false, description: 'Minimum rating filter (1-5)' })
  @ApiQuery({ name: 'featured', required: false, description: 'Filter by featured services only' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active services only (default: true)' })
  @ApiQuery({ name: 'latitude', required: false, description: 'Latitude for location-based search' })
  @ApiQuery({ name: 'longitude', required: false, description: 'Longitude for location-based search' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in kilometers (default: 50)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['price', 'rating', 'popularity', 'relevance', 'duration'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page (default: 20, max: 100)' })
  async searchServices(@Query() searchDto: SearchServicesDto): Promise<ServiceSearchResultDto> {
    this.logger.debug('Service search request received', 'SearchController');
    return this.searchService.searchServices(searchDto);
  }

  @Public()
  @Get('combined')
  @ApiOperation({
    summary: 'Combined search',
    description: 'Search both professionals and services with a single query, returning comprehensive results'
  })
  @ApiResponse({
    status: 200,
    description: 'Combined search results',
    type: CombinedSearchResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters'
  })
  async combinedSearch(@Query() searchDto: SearchProfessionalsDto): Promise<CombinedSearchResultDto> {
    this.logger.debug('Combined search request received', 'SearchController');
    return this.searchService.combinedSearch(searchDto);
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({
    summary: 'Get search suggestions',
    description: 'Get search suggestions for professionals, services, and categories based on partial query'
  })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        professionals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              businessName: { type: 'string' }
            }
          }
        },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              category: { type: 'string' }
            }
          }
        },
        categories: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiQuery({ name: 'query', required: true, description: 'Search query (minimum 2 characters)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of suggestions (default: 10)' })
  async getSearchSuggestions(
    @Query('query') query: string,
    @Query('limit') limit: number = 10
  ) {
    this.logger.debug('Search suggestions request received', 'SearchController');
    return this.searchService.getSearchSuggestions(query, limit);
  }

  @Public()
  @Get('categories')
  @ApiOperation({
    summary: 'Get all service categories',
    description: 'Retrieve all available service categories for filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Service categories retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          label: { type: 'string' },
          description: { type: 'string' }
        }
      }
    }
  })
  async getServiceCategories() {
    this.logger.debug('Service categories request received', 'SearchController');
    
    const categories = [
      { value: 'HAIR_STYLING', label: 'Hair Styling', description: 'Hair cuts, styling, coloring, and treatments' },
      { value: 'MAKEUP', label: 'Makeup', description: 'Professional makeup application and tutorials' },
      { value: 'NAIL_ART', label: 'Nail Art', description: 'Manicures, pedicures, and nail art designs' },
      { value: 'FACIAL_TREATMENT', label: 'Facial Treatment', description: 'Facial cleansing, masks, and treatments' },
      { value: 'MASSAGE', label: 'Massage', description: 'Therapeutic and relaxation massages' },
      { value: 'SKIN_CARE', label: 'Skin Care', description: 'Skin care consultations and treatments' },
      { value: 'BODY_TREATMENT', label: 'Body Treatment', description: 'Body wraps, scrubs, and treatments' },
      { value: 'OTHER', label: 'Other', description: 'Additional beauty and wellness services' }
    ];

    return categories;
  }

  @Public()
  @Get('filters')
  @ApiOperation({
    summary: 'Get available search filters',
    description: 'Retrieve all available search filters and their options for building search interfaces'
  })
  @ApiResponse({
    status: 200,
    description: 'Search filters retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        priceRanges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              min: { type: 'number' },
              max: { type: 'number' }
            }
          }
        },
        ratingRanges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              value: { type: 'number' }
            }
          }
        },
        availabilityOptions: {
          type: 'array',
          items: { type: 'string' }
        },
        sortOptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getSearchFilters() {
    this.logger.debug('Search filters request received', 'SearchController');
    
    return {
      priceRanges: [
        { label: 'Under $25', min: 0, max: 2500 },
        { label: '$25 - $50', min: 2500, max: 5000 },
        { label: '$50 - $100', min: 5000, max: 10000 },
        { label: '$100 - $200', min: 10000, max: 20000 },
        { label: 'Over $200', min: 20000, max: null }
      ],
      ratingRanges: [
        { label: '4+ Stars', value: 4 },
        { label: '4.5+ Stars', value: 4.5 },
        { label: '5 Stars', value: 5 }
      ],
      availabilityOptions: [
        'Available Today',
        'Available This Week',
        'Available This Weekend',
        'Available Next Week'
      ],
      sortOptions: [
        { value: 'relevance', label: 'Most Relevant' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'price', label: 'Price: Low to High' },
        { value: 'distance', label: 'Nearest First' },
        { value: 'experience', label: 'Most Experienced' }
      ]
    };
  }
}
