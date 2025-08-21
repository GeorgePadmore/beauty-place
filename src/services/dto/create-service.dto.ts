import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus, ServiceType, PricingModel } from '../entities/service.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';

export class CreateServiceDto {
  @ApiProperty({ description: 'Professional ID who owns this service' })
  @IsString()
  professionalId: string;

  @ApiProperty({ description: 'Name of the service' })
  @IsString()
  serviceName: string;

  @ApiPropertyOptional({ description: 'Detailed description of the service' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Service category', enum: ServiceCategory })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiPropertyOptional({ description: 'Service status', enum: ServiceStatus, default: ServiceStatus.DRAFT })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({ description: 'Service type', enum: ServiceType, default: ServiceType.SINGLE })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiPropertyOptional({ description: 'Pricing model', enum: PricingModel, default: PricingModel.FIXED })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiProperty({ description: 'Base price of the service' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ description: 'Discounted price (if applicable)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountedPrice?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Duration of the service in minutes' })
  @IsNumber()
  @Min(1)
  @Max(480) // Max 8 hours
  durationMinutes: number;

  @ApiPropertyOptional({ description: 'Whether the service is featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Featured until date' })
  @IsOptional()
  @IsDateString()
  featuredUntil?: string;

  @ApiPropertyOptional({ description: 'Travel fee for the service' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFee?: number;

  @ApiPropertyOptional({ description: 'Travel fee per kilometer' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFeePerKm?: number;

  @ApiPropertyOptional({ description: 'Maximum travel distance in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  maxTravelDistance?: number;
}
