import { ApiProperty } from '@nestjs/swagger';
import { Professional } from '../../professionals/entities/professional.entity';
import { Service } from '../../services/entities/service.entity';

export class SearchResultDto {
  @ApiProperty({ description: 'Total number of results' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of results per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there are more results' })
  hasMore: boolean;

  @ApiProperty({ description: 'Search query used' })
  query?: string;

  @ApiProperty({ description: 'Filters applied' })
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Sorting applied' })
  sorting?: {
    field: string;
    order: 'asc' | 'desc';
  };

  @ApiProperty({ description: 'Location used for search (if applicable)' })
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export class ProfessionalSearchResultDto extends SearchResultDto {
  @ApiProperty({ description: 'List of professionals matching search criteria', type: [Professional] })
  professionals: Professional[];

  @ApiProperty({ description: 'Distance information for location-based searches' })
  distances?: Array<{
    professionalId: string;
    distance: number;
    unit: 'km';
  }>;
}

export class ServiceSearchResultDto extends SearchResultDto {
  @ApiProperty({ description: 'List of services matching search criteria', type: [Service] })
  services: Service[];

  @ApiProperty({ description: 'Professional information for services' })
  professionals?: Array<{
    serviceId: string;
    professional: Professional;
  }>;
}

export class CombinedSearchResultDto extends SearchResultDto {
  @ApiProperty({ description: 'List of professionals matching search criteria', type: [Professional] })
  professionals: Professional[];

  @ApiProperty({ description: 'List of services matching search criteria', type: [Service] })
  services: Service[];

  @ApiProperty({ description: 'Distance information for location-based searches' })
  distances?: Array<{
    professionalId: string;
    distance: number;
    unit: 'km';
  }>;
}
