import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  PAYPAL = 'paypal',
}

export class CreateWithdrawalRequestDto {
  @ApiProperty({
    description: 'Amount to withdraw in cents',
    example: 5000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({
    description: 'Withdrawal method',
    enum: WithdrawalMethod,
    example: WithdrawalMethod.BANK_TRANSFER,
  })
  @IsEnum(WithdrawalMethod)
  method: WithdrawalMethod;

  @ApiProperty({
    description: 'Bank account ID or payment method ID',
    example: 'ba_1234567890',
  })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the withdrawal',
    example: 'Monthly payout',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Preferred withdrawal date',
    example: '2025-08-25',
  })
  @IsOptional()
  @IsString()
  preferredDate?: string;
}

export class UpdateWithdrawalRequestDto {
  @ApiPropertyOptional({
    description: 'New status for the withdrawal request',
    enum: ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Admin notes for the withdrawal',
    example: 'Approved for processing',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Processing date',
    example: '2025-08-25',
  })
  @IsOptional()
  @IsString()
  processedAt?: string;

  @ApiPropertyOptional({
    description: 'Failure reason if the withdrawal failed',
    example: 'Insufficient funds',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}
