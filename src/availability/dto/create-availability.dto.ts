import { IsUUID, IsEnum, IsString, IsBoolean, IsOptional, IsNumber, IsDateString, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityStatus, DayOfWeek } from '../entities/availability.entity';

export class CreateAvailabilityDto {
  @ApiProperty({ description: 'Professional ID' })
  @IsUUID()
  professionalId: string;

  @ApiProperty({ 
    description: 'Day of week (0=Sunday, 1=Monday, etc.)',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiPropertyOptional({ description: 'Specific date override (for non-recurring availability)' })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiProperty({ 
    description: 'Start time in HH:MM format',
    example: '09:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format'
  })
  startTime: string;

  @ApiProperty({ 
    description: 'End time in HH:MM format',
    example: '17:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format'
  })
  endTime: string;

  @ApiProperty({ 
    description: 'Availability status',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE
  })
  @IsEnum(AvailabilityStatus)
  @IsOptional()
  status?: AvailabilityStatus = AvailabilityStatus.AVAILABLE;

  @ApiProperty({ 
    description: 'Whether this slot is available',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;

  @ApiProperty({ 
    description: 'Whether this is a recurring weekly schedule',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean = true;

  @ApiPropertyOptional({ 
    description: 'Break start time in HH:MM format',
    example: '12:00'
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Break start time must be in HH:MM format'
  })
  breakStartTime?: string;

  @ApiPropertyOptional({ 
    description: 'Break end time in HH:MM format',
    example: '13:00'
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Break end time must be in HH:MM format'
  })
  breakEndTime?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum bookings allowed in this slot',
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxBookings?: number;

  @ApiProperty({ 
    description: 'Hours in advance bookings can be made',
    default: 24,
    minimum: 1,
    maximum: 168
  })
  @IsNumber()
  @Min(1)
  @Max(168) // 1 week
  @IsOptional()
  advanceBookingHours?: number = 24;

  @ApiPropertyOptional({ description: 'Additional notes about this availability' })
  @IsOptional()
  @IsString()
  notes?: string;
}
