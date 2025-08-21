import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceAccount } from './service-account.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum TransactionType {
  // Credit transactions (money coming in)
  PAYMENT = 'payment', // Client pays for service
  REFUND = 'refund', // Money returned to client
  WITHDRAWAL = 'withdrawal', // Professional withdraws money
  FEE = 'fee', // Platform fee deduction
  ADJUSTMENT = 'adjustment', // Manual adjustment
  BONUS = 'bonus', // Platform bonus or promotion
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('service_account_transactions')
@Index(['serviceAccountId'])
@Index(['transactionType'])
@Index(['status'])
@Index(['stripePaymentIntentId'])
@Index(['processingId'])
@Index(['createdAt'])
export class ServiceAccountTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_account_id', type: 'uuid' })
  serviceAccountId: string;

  @Column({ name: 'processing_id', type: 'varchar', length: 255, nullable: true })
  processingId: string; // Internal processing ID

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string; // Stripe payment intent ID

  @Column({ name: 'stripe_transfer_id', type: 'varchar', length: 255, nullable: true })
  stripeTransferId: string; // Stripe transfer ID for withdrawals

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string; // Related booking if applicable

  // Balance before and after (using DECIMAL for precision)
  @Column({ name: 'gross_balance_before', type: 'decimal', precision: 15, scale: 2 })
  grossBalanceBefore: number;

  @Column({ name: 'gross_balance_after', type: 'decimal', precision: 15, scale: 2 })
  grossBalanceAfter: number;

  @Column({ name: 'net_balance_before', type: 'decimal', precision: 15, scale: 2 })
  netBalanceBefore: number;

  @Column({ name: 'net_balance_after', type: 'decimal', precision: 15, scale: 2 })
  netBalanceAfter: number;

  // Transaction amounts (using DECIMAL for precision)
  @Column({ name: 'gross_amount', type: 'decimal', precision: 15, scale: 2 })
  grossAmount: number; // Total transaction amount

  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2 })
  netAmount: number; // Amount after fees

  @Column({ name: 'platform_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  platformFee: number; // Platform fee amount

  @Column({ name: 'stripe_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  stripeFee: number; // Stripe processing fee

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherFees: number; // Any other fees

  // Transaction details
  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: false,
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionTypeExtra: string; // Additional transaction type info

  @Column({ type: 'text', nullable: true })
  description: string; // Human-readable description

  @Column({ type: 'text', nullable: true })
  notes: string; // Internal notes

  @Column({ type: 'text', nullable: true })
  failureReason: string; // Reason for failure if applicable

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ServiceAccount, (account) => account.transactions)
  @JoinColumn({ name: 'serviceAccountId' })
  serviceAccount: ServiceAccount;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  // Helper methods
  get grossAmountDollars(): number {
    return this.grossAmount;
  }

  get netAmountDollars(): number {
    return this.netAmount;
  }

  get platformFeeDollars(): number {
    return this.platformFee;
  }

  get stripeFeeDollars(): number {
    return this.stripeFee;
  }

  get totalFees(): number {
    return this.platformFee + this.stripeFee + this.otherFees;
  }

  get totalFeesDollars(): number {
    return this.totalFees;
  }

  get grossBalanceBeforeDollars(): number {
    return this.grossBalanceBefore;
  }

  get grossBalanceAfterDollars(): number {
    return this.grossBalanceAfter;
  }

  get netBalanceBeforeDollars(): number {
    return this.netBalanceBefore;
  }

  get netBalanceAfterDollars(): number {
    return this.netBalanceAfter;
  }

  isCredit(): boolean {
    return [
      TransactionType.PAYMENT,
      TransactionType.REFUND,
      TransactionType.BONUS,
    ].includes(this.transactionType);
  }

  isDebit(): boolean {
    return [
      TransactionType.WITHDRAWAL,
      TransactionType.FEE,
      TransactionType.ADJUSTMENT,
    ].includes(this.transactionType);
  }

  isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  markAsCompleted(): void {
    this.status = TransactionStatus.COMPLETED;
  }

  markAsFailed(reason: string): void {
    this.status = TransactionStatus.FAILED;
    this.failureReason = reason;
  }
}
