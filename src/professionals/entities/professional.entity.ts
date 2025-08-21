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
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Availability } from '../../availability/entities/availability.entity';
import { ServiceAccount } from '../../payments/entities/service-account.entity';

export enum TravelMode {
  MOBILE = 'mobile',
  STATIONARY = 'stationary',
  BOTH = 'both',
}

export enum ServiceCategory {
  HAIR = 'hair',
  NAILS = 'nails',
  MAKEUP = 'makeup',
  MASSAGE = 'massage',
  FACIAL = 'facial',
  WAXING = 'waxing',
  OTHER = 'other',
}

@Entity('professionals')
@Index(['latitude', 'longitude'])
@Index(['category'])
@Index(['hourlyRateCents'])
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'business_name', type: 'varchar', length: 255, nullable: true })
  businessName: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
    nullable: false,
  })
  category: ServiceCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'hourly_rate_cents', type: 'integer', nullable: false })
  hourlyRateCents: number;

  @Column({
    name: 'travel_mode',
    type: 'enum',
    enum: TravelMode,
    default: TravelMode.STATIONARY,
  })
  travelMode: TravelMode;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.professional)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Service, (service) => service.professional)
  services: Service[];

  @OneToMany(() => Availability, (availability) => availability.professional)
  availability: Availability[];

  @OneToOne(() => ServiceAccount, (serviceAccount) => serviceAccount.professional)
  serviceAccount: ServiceAccount;

  // Helper methods
  get fullAddress(): string {
    const parts = [this.address, this.city, this.state, this.zipCode];
    return parts.filter(Boolean).join(', ');
  }

  get hourlyRate(): number {
    return this.hourlyRateCents / 100;
  }

  setHourlyRate(rate: number): void {
    this.hourlyRateCents = Math.round(rate * 100);
  }
}
