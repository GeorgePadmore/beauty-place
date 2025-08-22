import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, BookingType, PaymentStatus } from '../entities/booking.entity';

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({ description: 'Client ID' })
  clientId: string;

  @ApiProperty({ description: 'Professional ID' })
  professionalId: string;

  @ApiProperty({ description: 'Service ID' })
  serviceId: string;

  @ApiProperty({ description: 'Start time of the booking' })
  startTime: Date;

  @ApiProperty({ description: 'End time of the booking' })
  endTime: Date;

  @ApiProperty({ description: 'Total price in dollars' })
  totalPrice: number;

  @ApiProperty({ description: 'Service price in dollars' })
  servicePrice: number;

  @ApiProperty({ description: 'Travel fee in dollars' })
  travelFee: number;

  @ApiProperty({ description: 'Platform fee in dollars' })
  platformFee: number;

  @ApiProperty({ description: 'Discount amount in dollars' })
  discount: number;

  @ApiProperty({ 
    description: 'Booking status',
    enum: BookingStatus
  })
  status: BookingStatus;

  @ApiProperty({ 
    description: 'Payment status',
    enum: PaymentStatus
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({ 
    description: 'Type of booking',
    enum: BookingType
  })
  bookingType: BookingType;

  @ApiPropertyOptional({ description: 'Stripe payment intent ID' })
  stripePaymentIntentId?: string;

  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'Location details' })
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };

  @ApiPropertyOptional({ description: 'Client notes' })
  clientNotes?: string;

  @ApiPropertyOptional({ description: 'Professional notes' })
  professionalNotes?: string;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  cancellationReason?: string;

  @ApiPropertyOptional({ description: 'User ID who cancelled the booking' })
  cancelledBy?: string;

  @ApiPropertyOptional({ description: 'When the booking was cancelled' })
  cancelledAt?: Date;

  @ApiPropertyOptional({ description: 'When confirmation was sent' })
  confirmationSentAt?: Date;

  @ApiPropertyOptional({ description: 'When reminder was sent' })
  reminderSentAt?: Date;

  @ApiPropertyOptional({ description: 'When the booking was completed' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Client rating (1-5)' })
  rating?: number;

  @ApiPropertyOptional({ description: 'Client review' })
  review?: string;

  @ApiPropertyOptional({ description: 'When the review was submitted' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ description: 'Original booking ID if this was rescheduled' })
  rescheduledFrom?: string;

  @ApiPropertyOptional({ description: 'New booking ID if this was rescheduled' })
  rescheduledTo?: string;

  @ApiPropertyOptional({ description: 'When the booking was rescheduled' })
  rescheduledAt?: Date;

  @ApiPropertyOptional({ description: 'User ID who rescheduled the booking' })
  rescheduledBy?: string;

  @ApiProperty({ description: 'Duration in minutes' })
  durationMinutes: number;

  @ApiProperty({ description: 'Duration in hours' })
  durationHours: number;

  @ApiProperty({ description: 'Whether the booking is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  // Computed properties
  @ApiProperty({ description: 'Whether the booking is confirmed' })
  isConfirmed: boolean;

  @ApiProperty({ description: 'Whether the booking is pending' })
  isPending: boolean;

  @ApiProperty({ description: 'Whether the booking is cancelled' })
  isCancelled: boolean;

  @ApiProperty({ description: 'Whether the booking is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Whether the booking is rescheduled' })
  isRescheduled: boolean;

  @ApiProperty({ description: 'Whether the booking is a no-show' })
  isNoShow: boolean;

  @ApiProperty({ description: 'Whether the booking can be cancelled' })
  canBeCancelled: boolean;

  @ApiProperty({ description: 'Whether the booking can be rescheduled' })
  canBeRescheduled: boolean;

  @ApiProperty({ description: 'Whether the booking can be completed' })
  canBeCompleted: boolean;

  @ApiProperty({ description: 'Whether the payment is completed' })
  isPaid: boolean;

  @ApiProperty({ description: 'Whether the payment is pending' })
  isPaymentPending: boolean;

  @ApiProperty({ description: 'Whether the payment failed' })
  isPaymentFailed: boolean;

  @ApiProperty({ description: 'Whether there has been a refund' })
  hasRefund: boolean;

  @ApiProperty({ description: 'Whether the booking is upcoming' })
  isUpcoming: boolean;

  @ApiProperty({ description: 'Whether the booking is in the past' })
  isPast: boolean;

  @ApiProperty({ description: 'Whether the booking is today' })
  isToday: boolean;

  @ApiProperty({ description: 'Time until booking starts in milliseconds' })
  timeUntilStart: number;

  @ApiProperty({ description: 'Time until booking starts in minutes' })
  timeUntilStartMinutes: number;

  @ApiProperty({ description: 'Time until booking starts in hours' })
  timeUntilStartHours: number;

  // Related entity information
  @ApiProperty({ description: 'Client email' })
  clientEmail: string;

  @ApiProperty({ description: 'Client full name' })
  clientFullName: string;

  @ApiProperty({ description: 'Professional business name' })
  professionalBusinessName: string;

  @ApiProperty({ description: 'Professional title' })
  professionalTitle: string;

  @ApiProperty({ description: 'Service name' })
  serviceName: string;

  @ApiProperty({ description: 'Service category' })
  serviceCategory: string;
}
