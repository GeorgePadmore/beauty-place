import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Professional } from '../../professionals/entities/professional.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';
import { Booking } from '../../bookings/entities/booking.entity';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DRAFT = 'draft',
}

export enum ServiceType {
  SINGLE = 'single',
  PACKAGE = 'package',
  SUBSCRIPTION = 'subscription',
  CUSTOM = 'custom',
}

export enum PricingModel {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  PER_SESSION = 'per_session',
  PACKAGE = 'package',
  NEGOTIABLE = 'negotiable',
}

@Entity('services')
@Index(['professionalId'])
@Index(['category'])
@Index(['status'])
@Index(['isFeatured'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'professional_id', type: 'uuid', nullable: false })
  professionalId: string;

  @ManyToOne(() => Professional, (professional) => professional.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @Column({ name: 'service_name', type: 'varchar', length: 255, nullable: false })
  serviceName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ServiceCategory, nullable: false })
  category: ServiceCategory;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.DRAFT })
  status: ServiceStatus;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.SINGLE })
  serviceType: ServiceType;

  @Column({ type: 'enum', enum: PricingModel, default: PricingModel.FIXED })
  pricingModel: PricingModel;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, nullable: false })
  basePrice: number;

  @Column({ name: 'discounted_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedPrice: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: false })
  durationMinutes: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'featured_until', type: 'timestamp', nullable: true })
  featuredUntil: Date | null;

  @Column({ name: 'travel_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  travelFee: number;

  @Column({ name: 'travel_fee_per_km', type: 'decimal', precision: 10, scale: 2, default: 0 })
  travelFeePerKm: number;

  @Column({ name: 'max_travel_distance', type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxTravelDistance: number;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_bookings', type: 'int', default: 0 })
  totalBookings: number;

  @Column({ name: 'completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  // Methods
  isAvailable(): boolean {
    return this.status === ServiceStatus.ACTIVE && !this.isDeleted;
  }

  canAcceptBookings(): boolean {
    return this.isAvailable() && this.totalReviews > 0 && this.averageRating >= 3.0;
  }

  getFinalPrice(): number {
    return this.discountedPrice || this.basePrice;
  }

  getTravelFee(distanceKm: number): number {
    if (distanceKm <= 0) return 0;
    if (this.maxTravelDistance && distanceKm > this.maxTravelDistance) {
      throw new Error('Distance exceeds maximum travel distance');
    }
    return this.travelFee + (distanceKm * this.travelFeePerKm);
  }
}
