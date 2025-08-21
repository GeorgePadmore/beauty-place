import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfessionalStatus, VerificationStatus, TravelMode } from '../entities/professional.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';

export class ProfessionalResponseDto {
  @ApiProperty({ description: 'Professional unique identifier' })
  id: string;

  @ApiProperty({ description: 'Associated user ID' })
  userId: string;

  @ApiPropertyOptional({ description: 'Business name' })
  businessName?: string;

  @ApiProperty({ description: 'Professional title or designation' })
  professionalTitle: string;

  @ApiPropertyOptional({ description: 'Professional bio' })
  bio?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  description?: string;

  @ApiProperty({ description: 'Service category', enum: ServiceCategory })
  category: ServiceCategory;

  @ApiProperty({ description: 'Professional status', enum: ProfessionalStatus })
  status: ProfessionalStatus;

  @ApiProperty({ description: 'Verification status', enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @ApiPropertyOptional({ description: 'Verification date' })
  verificationDate?: Date;

  @ApiPropertyOptional({ description: 'Verification notes' })
  verificationNotes?: string;

  @ApiPropertyOptional({ description: 'Years of experience' })
  yearsExperience?: number;

  @ApiPropertyOptional({ description: 'Certifications' })
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    certificateNumber?: string;
  }>;

  @ApiPropertyOptional({ description: 'Portfolio images' })
  portfolioImages?: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
    uploadedAt: string;
  }>;

  @ApiProperty({ description: 'Service areas' })
  serviceAreas: Array<{
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    radiusKm: number;
    travelFee: number;
  }>;

  @ApiProperty({ description: 'Travel mode', enum: TravelMode })
  travelMode: TravelMode;

  @ApiProperty({ description: 'Base travel fee' })
  baseTravelFee: number;

  @ApiProperty({ description: 'Travel fee per kilometer' })
  travelFeePerKm: number;

  @ApiPropertyOptional({ description: 'Maximum travel distance in kilometers' })
  maxTravelDistance?: number;

  @ApiProperty({ description: 'Working hours' })
  workingHours: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };

  @ApiProperty({ description: 'Average rating' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews' })
  totalReviews: number;

  @ApiProperty({ description: 'Total number of bookings' })
  totalBookings: number;

  @ApiProperty({ description: 'Completion rate percentage' })
  completionRate: number;

  @ApiPropertyOptional({ description: 'Response time in minutes' })
  responseTimeMinutes?: number;

  @ApiProperty({ description: 'Is featured professional' })
  isFeatured: boolean;

  @ApiPropertyOptional({ description: 'Featured until date' })
  featuredUntil?: Date | null;

  @ApiProperty({ description: 'Is premium professional' })
  isPremium: boolean;

  @ApiPropertyOptional({ description: 'Premium until date' })
  premiumUntil?: Date | null;

  @ApiPropertyOptional({ description: 'Social media links' })
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };

  @ApiPropertyOptional({ description: 'Contact preferences' })
  contactPreferences?: {
    preferredContactMethod: 'email' | 'phone' | 'both';
    responseTime: number;
    autoReplyMessage?: string;
  };

  @ApiPropertyOptional({ description: 'Insurance information' })
  insuranceInfo?: {
    hasInsurance: boolean;
    insuranceProvider?: string;
    policyNumber?: string;
    expiryDate?: string;
    coverageAmount?: number;
  };

  @ApiPropertyOptional({ description: 'Background check information' })
  backgroundCheck?: {
    isCompleted: boolean;
    completedDate?: string;
    expiresDate?: string;
    status: 'pending' | 'passed' | 'failed' | 'expired';
    notes?: string;
  };

  @ApiPropertyOptional({ description: 'Emergency contact' })
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };

  @ApiPropertyOptional({ description: 'Banking information (masked for security)' })
  bankingInfo?: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountType: 'checking' | 'savings';
  };

  @ApiPropertyOptional({ description: 'Tax information (masked for security)' })
  taxInfo?: {
    taxId: string;
    taxIdType: 'ssn' | 'ein' | 'other';
    businessName?: string;
    businessAddress?: string;
  };

  @ApiProperty({ description: 'Is deleted' })
  isDeleted: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  // Computed properties
  @ApiProperty({ description: 'Is available for bookings' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Can accept new bookings' })
  canAcceptBookings: boolean;

  // User information (from relationship)
  @ApiPropertyOptional({ description: 'User email' })
  userEmail?: string;

  @ApiPropertyOptional({ description: 'User first name' })
  userFirstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  userLastName?: string;

  @ApiPropertyOptional({ description: 'User phone' })
  userPhone?: string;
}
