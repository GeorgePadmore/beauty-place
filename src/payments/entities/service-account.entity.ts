import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Professional } from '../../professionals/entities/professional.entity';
import { ServiceAccountTransaction } from './service-account-transaction.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';

@Entity('service_accounts')
@Index(['professionalId'], { unique: true })
@Index(['isActive'])
export class ServiceAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  professionalId: string;

  // Balance fields (using DECIMAL for precision)
  @Column({ name: 'gross_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossBalance: number; // Total earnings before fees

  @Column({ name: 'net_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netBalance: number; // Available balance after platform fees

  // Account status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'is_suspended', type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ name: 'suspension_reason', type: 'text', nullable: true })
  suspensionReason: string;

  @Column({ name: 'last_withdrawal_at', type: 'timestamp', nullable: true })
  lastWithdrawalAt: Date;

  @Column({ name: 'last_transaction_at', type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Professional, (professional) => professional.serviceAccount)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @OneToMany(
    () => ServiceAccountTransaction,
    (transaction) => transaction.serviceAccount,
  )
  transactions: ServiceAccountTransaction[];

  @OneToMany(() => WithdrawalRequest, (withdrawal) => withdrawal.serviceAccount)
  withdrawalRequests: WithdrawalRequest[];

  // Helper methods
  get grossBalanceDollars(): number {
    return this.grossBalance;
  }

  get netBalanceDollars(): number {
    return this.netBalance;
  }

  get availableBalance(): number {
    return this.netBalance;
  }

  get availableBalanceDollars(): number {
    return this.availableBalance;
  }

  canWithdraw(amount: number): boolean {
    return (
      this.isActive &&
      !this.isSuspended &&
      !this.isDeleted &&
      amount <= this.availableBalance
    );
  }

  calculatePlatformFee(amount: number, feePercentage: number): number {
    return (amount * feePercentage) / 100;
  }

  calculateNetAmount(grossAmount: number, feePercentage: number): number {
    const fee = this.calculatePlatformFee(grossAmount, feePercentage);
    return grossAmount - fee;
  }
}
