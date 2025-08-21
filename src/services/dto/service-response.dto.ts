import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus, ServiceType, PricingModel } from '../entities/service.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';

export class ServiceResponseDto {
  @ApiProperty({ description: 'Service unique identifier' })
  id: string;

  @ApiProperty({ description: 'Professional ID who owns this service' })
  professionalId: string;

  @ApiProperty({ description: 'Name of the service' })
  serviceName: string;

  @ApiPropertyOptional({ description: 'Detailed description of the service' })
  description?: string;

  @ApiProperty({ description: 'Service category', enum: ServiceCategory })
  category: ServiceCategory;

  @ApiProperty({ description: 'Service status', enum: ServiceStatus })
  status: ServiceStatus;

  @ApiProperty({ description: 'Service type', enum: ServiceType })
  serviceType: ServiceType;

  @ApiProperty({ description: 'Pricing model', enum: PricingModel })
  pricingModel: PricingModel;

  @ApiProperty({ description: 'Base price of the service' })
  basePrice: number;

  @ApiPropertyOptional({ description: 'Discounted price (if applicable)' })
  discountedPrice?: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Duration of the service in minutes' })
  durationMinutes: number;

  @ApiProperty({ description: 'Whether the service is featured' })
  isFeatured: boolean;

  @ApiPropertyOptional({ description: 'Featured until date' })
  featuredUntil?: Date | null;

  @ApiProperty({ description: 'Travel fee for the service' })
  travelFee: number;

  @ApiProperty({ description: 'Travel fee per kilometer' })
  travelFeePerKm: number;

  @ApiPropertyOptional({ description: 'Maximum travel distance in kilometers' })
  maxTravelDistance?: number;

  @ApiProperty({ description: 'Average rating' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews' })
  totalReviews: number;

  @ApiProperty({ description: 'Total number of bookings' })
  totalBookings: number;

  @ApiProperty({ description: 'Completion rate percentage' })
  completionRate: number;

  @ApiProperty({ description: 'Is deleted' })
  isDeleted: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  // Computed properties
  @ApiProperty({ description: 'Is available for bookings' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Can accept new bookings' })
  canAcceptBookings: boolean;

  @ApiProperty({ description: 'Final price (discounted or base)' })
  finalPrice: number;

  // Professional information (from relationship)
  @ApiPropertyOptional({ description: 'Professional business name' })
  professionalBusinessName?: string;

  @ApiPropertyOptional({ description: 'Professional title' })
  professionalTitle?: string;

  @ApiPropertyOptional({ description: 'Professional category' })
  professionalCategory?: string;

  @ApiPropertyOptional({ description: 'Professional average rating' })
  professionalAverageRating?: number;
}
