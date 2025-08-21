import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityStatus, DayOfWeek } from '../entities/availability.entity';

export class AvailabilityResponseDto {
  @ApiProperty({ description: 'Availability ID' })
  id: string;

  @ApiProperty({ description: 'Professional ID' })
  professionalId: string;

  @ApiProperty({ 
    description: 'Day of week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY
  })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Day name', example: 'Monday' })
  dayName: string;

  @ApiPropertyOptional({ description: 'Specific date override' })
  date?: Date;

  @ApiProperty({ description: 'Start time', example: '09:00' })
  startTime: string;

  @ApiProperty({ description: 'End time', example: '17:00' })
  endTime: string;

  @ApiProperty({ 
    description: 'Availability status',
    enum: AvailabilityStatus
  })
  status: AvailabilityStatus;

  @ApiProperty({ description: 'Whether this slot is available' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Whether this is a recurring weekly schedule' })
  isRecurring: boolean;

  @ApiPropertyOptional({ description: 'Break start time' })
  breakStartTime?: string;

  @ApiPropertyOptional({ description: 'Break end time' })
  breakEndTime?: string;

  @ApiPropertyOptional({ description: 'Maximum bookings allowed' })
  maxBookings?: number;

  @ApiProperty({ description: 'Current number of bookings' })
  currentBookings: number;

  @ApiProperty({ description: 'Hours in advance bookings can be made' })
  advanceBookingHours: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

  @ApiProperty({ description: 'Duration in minutes' })
  durationMinutes: number;

  @ApiProperty({ description: 'Duration in hours' })
  durationHours: number;

  @ApiProperty({ description: 'Break duration in minutes' })
  breakDurationMinutes: number;

  @ApiProperty({ description: 'Available duration in minutes (excluding breaks)' })
  availableDurationMinutes: number;

  @ApiProperty({ description: 'Whether this slot can accept bookings' })
  canAcceptBooking: boolean;

  @ApiProperty({ description: 'Whether this slot is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  // Professional information
  @ApiProperty({ description: 'Professional business name' })
  professionalBusinessName: string;

  @ApiProperty({ description: 'Professional title' })
  professionalTitle: string;

  @ApiProperty({ description: 'Professional category' })
  professionalCategory: string;
}
