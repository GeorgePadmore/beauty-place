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
import { ServiceAccountTransaction } from './service-account-transaction.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WithdrawalMethod {
  STRIPE_TRANSFER = 'stripe_transfer',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  PAYPAL = 'paypal',
}

@Entity('withdrawal_requests')
@Index(['serviceAccountId'])
@Index(['status'])
@Index(['withdrawalMethod'])
@Index(['createdAt'])
export class WithdrawalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_account_id', type: 'uuid' })
  serviceAccountId: string;

  @Column({ name: 'requested_amount', type: 'decimal', precision: 15, scale: 2 })
  requestedAmount: number; // Amount in dollars

  @Column({ name: 'approved_amount', type: 'decimal', precision: 15, scale: 2 })
  approvedAmount: number; // Amount approved (may be less than requested)

  @Column({ name: 'processing_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  processingFee: number; // Processing fee in dollars

  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2 })
  netAmount: number; // Amount after processing fee

  @Column({
    name: 'withdrawal_method',
    type: 'enum',
    enum: WithdrawalMethod,
    default: WithdrawalMethod.STRIPE_TRANSFER,
  })
  withdrawalMethod: WithdrawalMethod;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  // Withdrawal method details
  @Column({ name: 'stripe_transfer_id', type: 'varchar', length: 255, nullable: true })
  stripeTransferId: string;

  @Column({ name: 'bank_account_id', type: 'varchar', length: 255, nullable: true })
  bankAccountId: string;

  @Column({ name: 'paypal_email', type: 'varchar', length: 255, nullable: true })
  paypalEmail: string;

  @Column({ name: 'bank_account_details', type: 'text', nullable: true })
  bankAccountDetails: string; // Encrypted bank account info

  // Processing details
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string; // Internal admin notes

  @Column({ name: 'user_notes', type: 'text', nullable: true })
  userNotes: string; // User's notes for the request

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ServiceAccount, (account) => account.withdrawalRequests)
  @JoinColumn({ name: 'serviceAccountId' })
  serviceAccount: ServiceAccount;

  @ManyToOne(() => ServiceAccountTransaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: ServiceAccountTransaction;

  // Helper methods
  get requestedAmountDollars(): number {
    return this.requestedAmount;
  }

  get approvedAmountDollars(): number {
    return this.approvedAmount;
  }

  get processingFeeDollars(): number {
    return this.processingFee;
  }

  get netAmountDollars(): number {
    return this.netAmount;
  }

  isPending(): boolean {
    return this.status === WithdrawalStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === WithdrawalStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === WithdrawalStatus.FAILED;
  }

  canBeCompleted(): boolean {
    return this.status === WithdrawalStatus.PENDING;
  }

  canBeFailed(): boolean {
    return this.status === WithdrawalStatus.PENDING;
  }

  markAsCompleted(): void {
    this.status = WithdrawalStatus.COMPLETED;
    this.completedAt = new Date();
  }

  markAsFailed(reason: string, adminNotes?: string): void {
    this.status = WithdrawalStatus.FAILED;
    this.rejectionReason = reason;
    this.rejectedAt = new Date();
    if (adminNotes) {
      this.adminNotes = adminNotes;
    }
  }
}
