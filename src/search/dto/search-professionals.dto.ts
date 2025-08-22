import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, IsArray, Min, Max, IsLatitude, IsLongitude } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '../../common/enums/service-category.enum';
import { ProfessionalStatus } from '../../professionals/entities/professional.entity';

export class SearchProfessionalsDto {
  @ApiPropertyOptional({ description: 'Search query for professional name, business name, or services' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Service category filter' })
  @IsOptional()
  @IsEnum(ServiceCategory)
  serviceCategory?: ServiceCategory;

  @ApiPropertyOptional({ description: 'Professional status filter' })
  @IsOptional()
  @IsEnum(ProfessionalStatus)
  status?: ProfessionalStatus;

  @ApiPropertyOptional({ description: 'Minimum rating filter (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum price filter in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Latitude for location-based search' })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for location-based search' })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Search radius in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius?: number;

  @ApiPropertyOptional({ description: 'Filter by featured professionals only' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Filter by premium professionals only' })
  @IsOptional()
  @IsBoolean()
  premium?: boolean;

  @ApiPropertyOptional({ description: 'Filter by professionals available today' })
  @IsOptional()
  @IsBoolean()
  availableToday?: boolean;

  @ApiPropertyOptional({ description: 'Filter by professionals available on specific date (ISO string)' })
  @IsOptional()
  @IsString()
  availableDate?: string;

  @ApiPropertyOptional({ description: 'Filter by professionals available at specific time (HH:MM)' })
  @IsOptional()
  @IsString()
  availableTime?: string;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['rating', 'price', 'distance', 'relevance', 'experience'] })
  @IsOptional()
  @IsString()
  sortBy?: 'rating' | 'price' | 'distance' | 'relevance' | 'experience';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Number of results per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
