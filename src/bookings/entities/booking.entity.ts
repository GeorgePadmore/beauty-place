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
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export enum BookingType {
  IN_PERSON = 'in_person',
  HOME_VISIT = 'home_visit',
  VIRTUAL = 'virtual',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  FULLY_REFUNDED = 'fully_refunded',
  FAILED = 'failed',
}

@Entity('bookings')
@Index(['professionalId', 'startTime', 'endTime'], { unique: true })
@Index(['clientId', 'startTime'])
@Index(['idempotencyKey'], { unique: true })
@Index(['stripePaymentIntentId'])
@Index(['status', 'isActive'])
@Index(['startTime', 'endTime'])
@Index(['paymentStatus'])
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

  @Column({ name: 'service_price_cents', type: 'integer', nullable: false })
  servicePriceCents: number;

  @Column({ name: 'travel_fee_cents', type: 'integer', default: 0 })
  travelFeeCents: number;

  @Column({ name: 'platform_fee_cents', type: 'integer', default: 0 })
  platformFeeCents: number;

  @Column({ name: 'discount_cents', type: 'integer', default: 0 })
  discountCents: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: BookingType,
    default: BookingType.IN_PERSON,
  })
  bookingType: BookingType;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true, unique: true })
  idempotencyKey: string;

  @Column({ name: 'location', type: 'jsonb', nullable: true })
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };

  @Column({ name: 'client_notes', type: 'text', nullable: true })
  clientNotes: string;

  @Column({ name: 'professional_notes', type: 'text', nullable: true })
  professionalNotes: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'confirmation_sent_at', type: 'timestamp', nullable: true })
  confirmationSentAt: Date;

  @Column({ name: 'reminder_sent_at', type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'rating', type: 'integer', nullable: true })
  rating: number;

  @Column({ name: 'review', type: 'text', nullable: true })
  review: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'rescheduled_from', type: 'uuid', nullable: true })
  rescheduledFrom: string;

  @Column({ name: 'rescheduled_to', type: 'uuid', nullable: true })
  rescheduledTo: string;

  @Column({ name: 'rescheduled_at', type: 'timestamp', nullable: true })
  rescheduledAt: Date;

  @Column({ name: 'rescheduled_by', type: 'uuid', nullable: true })
  rescheduledBy: string;

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
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => Professional, (professional) => professional.professionalBookings)
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @ManyToOne(() => Service, (service) => service.professional)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // Helper methods
  get totalPrice(): number {
    return this.totalPriceCents / 100;
  }

  setTotalPrice(price: number): void {
    this.totalPriceCents = Math.round(price * 100);
  }

  get servicePrice(): number {
    return this.servicePriceCents / 100;
  }

  setServicePrice(price: number): void {
    this.servicePriceCents = Math.round(price * 100);
  }

  get travelFee(): number {
    return this.travelFeeCents / 100;
  }

  setTravelFee(fee: number): void {
    this.travelFeeCents = Math.round(fee * 100);
  }

  get platformFee(): number {
    return this.platformFeeCents / 100;
  }

  setPlatformFee(fee: number): void {
    this.platformFeeCents = Math.round(fee * 100);
  }

  get discount(): number {
    return this.discountCents / 100;
  }

  setDiscount(discount: number): void {
    this.discountCents = Math.round(discount * 100);
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

  isRescheduled(): boolean {
    return this.status === BookingStatus.RESCHEDULED;
  }

  isNoShow(): boolean {
    return this.status === BookingStatus.NO_SHOW;
  }

  canBeCancelled(): boolean {
    return this.status === BookingStatus.PENDING || this.status === BookingStatus.CONFIRMED;
  }

  canBeRescheduled(): boolean {
    return this.status === BookingStatus.PENDING || this.status === BookingStatus.CONFIRMED;
  }

  canBeCompleted(): boolean {
    return this.status === BookingStatus.CONFIRMED;
  }

  isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  isPaymentPending(): boolean {
    return this.paymentStatus === PaymentStatus.PENDING;
  }

  isPaymentFailed(): boolean {
    return this.paymentStatus === PaymentStatus.FAILED;
  }

  hasRefund(): boolean {
    return this.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED || 
           this.paymentStatus === PaymentStatus.FULLY_REFUNDED;
  }

  calculateEndTime(serviceDurationMinutes: number): void {
    this.endTime = new Date(this.startTime.getTime() + serviceDurationMinutes * 60 * 1000);
  }

  calculateTotalPrice(): void {
    this.totalPriceCents = this.servicePriceCents + this.travelFeeCents + this.platformFeeCents - this.discountCents;
  }

  isUpcoming(): boolean {
    return this.startTime > new Date() && this.status === BookingStatus.CONFIRMED;
  }

  isPast(): boolean {
    return this.endTime < new Date();
  }

  isToday(): boolean {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    return this.startTime >= startOfDay && this.startTime < endOfDay;
  }

  getTimeUntilStart(): number {
    return this.startTime.getTime() - new Date().getTime();
  }

  getTimeUntilStartMinutes(): number {
    return Math.floor(this.getTimeUntilStart() / (1000 * 60));
  }

  getTimeUntilStartHours(): number {
    return Math.floor(this.getTimeUntilStartMinutes() / 60);
  }
}
