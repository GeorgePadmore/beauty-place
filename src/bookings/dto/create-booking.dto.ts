import { IsUUID, IsEnum, IsString, IsOptional, IsNumber, IsDateString, Min, Max, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingType } from '../entities/booking.entity';

class LocationDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({ description: 'GPS coordinates' })
  @IsOptional()
  @IsObject()
  coordinates?: { lat: number; lng: number };
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Professional ID' })
  @IsUUID()
  professionalId: string;

  @ApiProperty({ description: 'Service ID' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Start time of the booking', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ description: 'End time of the booking (auto-calculated if not provided)' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ 
    description: 'Type of booking',
    enum: BookingType,
    default: BookingType.IN_PERSON
  })
  @IsEnum(BookingType)
  @IsOptional()
  bookingType?: BookingType = BookingType.IN_PERSON;

  @ApiPropertyOptional({ description: 'Location details for the booking' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ description: 'Client notes for the professional' })
  @IsOptional()
  @IsString()
  clientNotes?: string;

  @ApiPropertyOptional({ description: 'Discount amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountCents?: number;

  @ApiPropertyOptional({ description: 'Idempotency key for preventing duplicate bookings' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
