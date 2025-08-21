import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PricingType {
  PLATFORM_FEE = 'platform_fee',
  WITHDRAWAL_FEE = 'withdrawal_fee',
  PROCESSING_FEE = 'processing_fee',
  MINIMUM_WITHDRAWAL = 'minimum_withdrawal',
  MAXIMUM_WITHDRAWAL = 'maximum_withdrawal',
}

@Entity('pricing_config')
@Index(['pricingType'], { unique: true })
export class PricingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PricingType,
    unique: true,
    nullable: false,
  })
  pricingType: PricingType;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  value: number; // For percentages, this is the percentage (e.g., 15.0 for 15%)

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // Human-readable name

  @Column({ type: 'text', nullable: true })
  description: string; // Detailed description

  @Column({ type: 'varchar', length: 20, default: 'percentage' })
  unit: string; // 'percentage', 'fixed_amount', 'currency'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional configuration data

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Helper methods
  getValueAsPercentage(): number {
    if (this.unit === 'percentage') {
      return this.value / 100; // Convert 15.0 to 0.15
    }
    return this.value;
  }

  getValueAsDecimal(): number {
    return this.value;
  }

  isPercentage(): boolean {
    return this.unit === 'percentage';
  }

  isFixedAmount(): boolean {
    return this.unit === 'fixed_amount';
  }
}
