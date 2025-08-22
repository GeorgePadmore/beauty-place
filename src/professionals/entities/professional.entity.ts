import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceAccount } from '../../payments/entities/service-account.entity';
import { Service } from '../../services/entities/service.entity';
import { Availability } from '../../availability/entities/availability.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';

export enum ProfessionalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum TravelMode {
  HOME_VISIT = 'home_visit',
  SALON_VISIT = 'salon_visit',
  BOTH = 'both',
}

@Entity('professionals')
@Index(['userId'], { unique: true })
@Index(['status'])
@Index(['verificationStatus'])
@Index(['category'])
@Index(['latitude', 'longitude'])
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true, nullable: false })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'business_name', type: 'varchar', length: 255, nullable: true })
  businessName: string;

  @Column({ name: 'professional_title', type: 'varchar', length: 255, nullable: false })
  professionalTitle: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ServiceCategory, nullable: false })
  category: ServiceCategory;

  @Column({ type: 'enum', enum: ProfessionalStatus, default: ProfessionalStatus.PENDING })
  status: ProfessionalStatus;

  @Column({ name: 'verification_status', type: 'enum', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verificationStatus: VerificationStatus;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes: string;

  @Column({ name: 'years_experience', type: 'int', nullable: true })
  yearsExperience: number;

  @Column({ name: 'certifications', type: 'jsonb', nullable: true })
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    certificateNumber?: string;
  }>;

  @Column({ name: 'portfolio_images', type: 'jsonb', nullable: true })
  portfolioImages: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
    uploadedAt: string;
  }>;

  @Column({ name: 'service_areas', type: 'jsonb', nullable: false })
  serviceAreas: Array<{
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    radiusKm: number;
    travelFee: number;
  }>;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'travel_mode', type: 'enum', enum: TravelMode, default: TravelMode.BOTH })
  travelMode: TravelMode;

  @Column({ name: 'base_travel_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseTravelFee: number;

  @Column({ name: 'travel_fee_per_km', type: 'decimal', precision: 10, scale: 2, default: 0 })
  travelFeePerKm: number;

  @Column({ name: 'max_travel_distance', type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxTravelDistance: number;

  @Column({ name: 'working_hours', type: 'jsonb', nullable: false })
  workingHours: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_bookings', type: 'int', default: 0 })
  totalBookings: number;

  @Column({ name: 'completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ name: 'response_time_minutes', type: 'int', nullable: true })
  responseTimeMinutes: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'featured_until', type: 'timestamp', nullable: true })
  featuredUntil: Date | null;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ name: 'premium_until', type: 'timestamp', nullable: true })
  premiumUntil: Date | null;

  @Column({ name: 'social_media', type: 'jsonb', nullable: true })
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };

  @Column({ name: 'contact_preferences', type: 'jsonb', nullable: true })
  contactPreferences: {
    preferredContactMethod: 'email' | 'phone' | 'both';
    responseTime: number; // in hours
    autoReplyMessage?: string;
  };

  @Column({ name: 'insurance_info', type: 'jsonb', nullable: true })
  insuranceInfo: {
    hasInsurance: boolean;
    insuranceProvider?: string;
    policyNumber?: string;
    expiryDate?: string;
    coverageAmount?: number;
  };

  @Column({ name: 'background_check', type: 'jsonb', nullable: true })
  backgroundCheck: {
    isCompleted: boolean;
    completedDate?: string;
    expiresDate?: string;
    status: 'pending' | 'passed' | 'failed' | 'expired';
    notes?: string;
  };

  @Column({ name: 'emergency_contact', type: 'jsonb', nullable: true })
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };

  @Column({ name: 'banking_info', type: 'jsonb', nullable: true })
  bankingInfo: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountType: 'checking' | 'savings';
  };

  @Column({ name: 'tax_info', type: 'jsonb', nullable: true })
  taxInfo: {
    taxId: string;
    taxIdType: 'ssn' | 'ein' | 'other';
    businessName?: string;
    businessAddress?: string;
  };

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => ServiceAccount, (serviceAccount) => serviceAccount.professional)
  serviceAccount: ServiceAccount;

  @OneToMany(() => Service, (service) => service.professional)
  services: Service[];

  @OneToMany(() => Availability, (availability) => availability.professional)
  availabilities: Availability[];

  @OneToMany(() => Booking, (booking) => booking.professional)
  professionalBookings: Booking[];

  // Methods
  isAvailable(): boolean {
    return this.status === ProfessionalStatus.ACTIVE && this.verificationStatus === VerificationStatus.VERIFIED;
  }

  canAcceptBookings(): boolean {
    return this.isAvailable() && this.totalReviews > 0 && this.averageRating >= 3.0;
  }

  getTravelFee(distanceKm: number): number {
    if (distanceKm <= 0) return 0;
    if (this.maxTravelDistance && distanceKm > this.maxTravelDistance) {
      throw new Error('Distance exceeds maximum travel distance');
    }
    return this.baseTravelFee + (distanceKm * this.travelFeePerKm);
  }

  updateRating(newRating: number): void {
    const totalRating = this.averageRating * this.totalReviews + newRating;
    this.totalReviews += 1;
    this.averageRating = totalRating / this.totalReviews;
  }

  updateCompletionRate(completed: boolean): void {
    if (completed) {
      this.totalBookings += 1;
      // This is a simplified calculation - in practice, you'd track completed vs total
      this.completionRate = 95.0; // Placeholder
    }
  }
}
