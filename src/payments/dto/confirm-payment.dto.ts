import { IsString, IsOptional, IsObject, IsString as IsStringValidator } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Payment intent ID to confirm',
    example: 'pi_3NkXvG2eZvKYlo2C1gF12345',
  })
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({
    description: 'Payment method ID to use for this payment',
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Return URL for redirect-based payment flows',
    example: 'https://example.com/success',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional parameters for the payment confirmation',
    example: { setup_future_usage: 'off_session' },
  })
  @IsOptional()
  @IsObject()
  additionalParameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Off-session usage type',
    example: 'off_session',
    enum: ['off_session', 'on_session'],
  })
  @IsOptional()
  @IsString()
  offSession?: 'off_session' | 'on_session';

  @ApiPropertyOptional({
    description: 'Whether to save the payment method for future use',
    example: false,
  })
  @IsOptional()
  @IsString()
  setupFutureUsage?: 'off_session' | 'on_session';
}
