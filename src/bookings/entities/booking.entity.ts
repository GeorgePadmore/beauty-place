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
import { User } from '../../users/entities/user.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { Service } from '../../services/entities/service.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
@Index(['professionalId', 'startTime', 'endTime'], { unique: true })
@Index(['clientId', 'startTime'])
@Index(['idempotencyKey'], { unique: true })
@Index(['stripePaymentIntentId'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ name: 'professional_id', type: 'uuid' })
  professionalId: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'start_time', type: 'timestamp', nullable: false })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: false })
  endTime: Date;

  @Column({ name: 'total_price_cents', type: 'integer', nullable: false })
  totalPriceCents: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true, unique: true })
  idempotencyKey: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.clientBookings)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => Professional, (professional) => professional.professionalBookings)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @ManyToOne(() => Service, (service) => service.professional)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  // Helper methods
  get totalPrice(): number {
    return this.totalPriceCents / 100;
  }

  setTotalPrice(price: number): void {
    this.totalPriceCents = Math.round(price * 100);
  }

  get durationMinutes(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  get durationHours(): number {
    return this.durationMinutes / 60;
  }

  isConfirmed(): boolean {
    return this.status === BookingStatus.CONFIRMED;
  }

  isPending(): boolean {
    return this.status === BookingStatus.PENDING;
  }

  isCancelled(): boolean {
    return this.status === BookingStatus.CANCELLED;
  }

  isCompleted(): boolean {
    return this.status === BookingStatus.COMPLETED;
  }

  canBeCancelled(): boolean {
    return this.status === BookingStatus.PENDING || this.status === BookingStatus.CONFIRMED;
  }

  calculateEndTime(serviceDurationMinutes: number): void {
    this.endTime = new Date(this.startTime.getTime() + serviceDurationMinutes * 60 * 1000);
  }
}
