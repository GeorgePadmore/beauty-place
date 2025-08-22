import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  CASH_APP = 'cashapp',
  US_BANK_ACCOUNT = 'us_bank_account',
}

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Amount in cents (e.g., 2000 for $20.00)',
    example: 2000,
    minimum: 50,
  })
  @IsNumber()
  @Min(50)
  amount: number;

  @ApiProperty({
    description: 'Three-letter ISO currency code',
    example: 'usd',
  })
  @IsString()
  currency: string = 'usd';

  @ApiProperty({
    description: 'ID of the booking this payment is for',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  bookingId: string;

  @ApiPropertyOptional({
    description: 'Payment method types to allow',
    example: ['card', 'bank_account'],
    enum: PaymentMethodType,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(PaymentMethodType, { each: true })
  paymentMethodTypes?: PaymentMethodType[];

  @ApiPropertyOptional({
    description: 'Customer email for receipt',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Description of the payment',
    example: 'Beauty service booking #123',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Metadata to attach to the payment intent',
    example: { service_type: 'haircut', professional_id: 'prof_123' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Application fee amount in cents',
    example: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  applicationFeeAmount?: number;

  @ApiPropertyOptional({
    description: 'Capture method: automatic or manual',
    example: 'automatic',
    enum: ['automatic', 'manual'],
  })
  @IsOptional()
  @IsString()
  captureMethod?: 'automatic' | 'manual' = 'automatic';

  @ApiPropertyOptional({
    description: 'Confirmation method: automatic or manual',
    example: 'automatic',
    enum: ['automatic', 'manual'],
  })
  @IsOptional()
  @IsString()
  confirmationMethod?: 'automatic' | 'manual' = 'automatic';

  @ApiPropertyOptional({
    description: 'Whether to save the payment method for future use',
    example: false,
  })
  @IsOptional()
  @IsString()
  setupFutureUsage?: 'off_session' | 'on_session';

  @ApiPropertyOptional({
    description: 'Statement descriptor for the charge',
    example: 'BEAUTY PLACE',
    maxLength: 22,
  })
  @IsOptional()
  @IsString()
  statementDescriptor?: string;

  @ApiPropertyOptional({
    description: 'Statement descriptor suffix',
    example: 'SERVICE',
    maxLength: 22,
  })
  @IsOptional()
  @IsString()
  statementDescriptorSuffix?: string;
}
