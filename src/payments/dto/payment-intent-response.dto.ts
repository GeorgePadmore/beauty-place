import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  REQUIRES_CAPTURE = 'requires_capture',
  CANCELED = 'canceled',
  SUCCEEDED = 'succeeded',
}

export class PaymentIntentResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the payment intent',
    example: 'pi_3NkXvG2eZvKYlo2C1gF12345',
  })
  id: string;

  @ApiProperty({
    description: 'Amount in cents',
    example: 2000,
  })
  amount: number;

  @ApiProperty({
    description: 'Three-letter ISO currency code',
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    description: 'Current status of the payment intent',
    enum: PaymentIntentStatus,
    example: PaymentIntentStatus.REQUIRES_PAYMENT_METHOD,
  })
  status: PaymentIntentStatus;

  @ApiProperty({
    description: 'ID of the booking this payment is for',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  bookingId: string;

  @ApiPropertyOptional({
    description: 'Client secret for confirming the payment',
    example: 'pi_3NkXvG2eZvKYlo2C1gF12345_secret_abc123',
  })
  clientSecret?: string;

  @ApiPropertyOptional({
    description: 'Payment method types allowed',
    example: ['card', 'bank_account'],
  })
  paymentMethodTypes?: string[];

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Description of the payment',
    example: 'Beauty service booking #123',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Metadata attached to the payment intent',
    example: { service_type: 'haircut', professional_id: 'prof_123' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Application fee amount in cents',
    example: 300,
  })
  applicationFeeAmount?: number;

  @ApiPropertyOptional({
    description: 'Capture method',
    example: 'automatic',
  })
  captureMethod?: string;

  @ApiPropertyOptional({
    description: 'Confirmation method',
    example: 'automatic',
  })
  confirmationMethod?: string;

  @ApiPropertyOptional({
    description: 'Statement descriptor',
    example: 'BEAUTY PLACE',
  })
  statementDescriptor?: string;

  @ApiPropertyOptional({
    description: 'Statement descriptor suffix',
    example: 'SERVICE',
  })
  statementDescriptorSuffix?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-08-22T12:00:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    example: '2025-08-22T12:00:00Z',
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Whether the payment intent is live or test mode',
    example: false,
  })
  livemode: boolean;

  @ApiProperty({
    description: 'Amount in dollars (formatted)',
    example: '$20.00',
  })
  amountFormatted: string;

  @ApiProperty({
    description: 'Application fee in dollars (formatted)',
    example: '$3.00',
  })
  applicationFeeFormatted: string;
}
