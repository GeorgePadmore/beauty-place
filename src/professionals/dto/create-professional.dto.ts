import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean, IsObject, ValidateNested, Min, Max, IsUrl, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfessionalStatus, TravelMode } from '../entities/professional.entity';
import { ServiceCategory } from '../../common/enums/service-category.enum';

class ServiceAreaDto {
  @ApiProperty({ description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Service radius in kilometers' })
  @IsNumber()
  @Min(1)
  @Max(100)
  radiusKm: number;

  @ApiProperty({ description: 'Travel fee for this area' })
  @IsNumber()
  @Min(0)
  travelFee: number;
}

class WorkingHoursDto {
  @ApiProperty({ description: 'Monday working hours' })
  @IsObject()
  monday: { start: string; end: string; isAvailable: boolean };

  @ApiProperty({ description: 'Tuesday working hours' })
  @IsObject()
  tuesday: { start: string; end: string; isAvailable: boolean };

  @ApiProperty({ description: 'Wednesday working hours' })
  @IsObject()
  wednesday: { start: string; end: string; isAvailable: boolean };

  @ApiProperty({ description: 'Thursday working hours' })
  @IsObject()
  thursday: { start: string; end: string; isAvailable: boolean };

  @ApiProperty({ description: 'Friday working hours' })
  @IsObject()
  friday: { start: string; end: string; isAvailable: boolean };

  @ApiProperty({ description: 'Saturday working hours' })
  @IsObject()
  saturday: { start: string; end: string; isAvailable: boolean };

  @ApiProperty({ description: 'Sunday working hours' })
  @IsObject()
  sunday: { start: string; end: string; isAvailable: boolean };
}

class CertificationDto {
  @ApiProperty({ description: 'Certification name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Issuing organization' })
  @IsString()
  issuer: string;

  @ApiProperty({ description: 'Date obtained' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Certificate number' })
  @IsOptional()
  @IsString()
  certificateNumber?: string;
}

class PortfolioImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Image caption' })
  @IsString()
  caption: string;

  @ApiProperty({ description: 'Is primary image' })
  @IsBoolean()
  isPrimary: boolean;

  @ApiProperty({ description: 'Upload date' })
  @IsDateString()
  uploadedAt: string;
}

class SocialMediaDto {
  @ApiPropertyOptional({ description: 'Instagram handle' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Facebook page' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ description: 'Twitter handle' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;
}

class ContactPreferencesDto {
  @ApiProperty({ description: 'Preferred contact method' })
  @IsString()
  preferredContactMethod: 'email' | 'phone' | 'both';

  @ApiProperty({ description: 'Response time in hours' })
  @IsNumber()
  @Min(1)
  @Max(72)
  responseTime: number;

  @ApiPropertyOptional({ description: 'Auto-reply message' })
  @IsOptional()
  @IsString()
  autoReplyMessage?: string;
}

class InsuranceInfoDto {
  @ApiProperty({ description: 'Has insurance' })
  @IsBoolean()
  hasInsurance: boolean;

  @ApiPropertyOptional({ description: 'Insurance provider' })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiPropertyOptional({ description: 'Policy number' })
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Coverage amount' })
  @IsOptional()
  @IsNumber()
  coverageAmount?: number;
}

class BackgroundCheckDto {
  @ApiProperty({ description: 'Background check completed' })
  @IsBoolean()
  isCompleted: boolean;

  @ApiPropertyOptional({ description: 'Completion date' })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiresDate?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: 'pending' | 'passed' | 'failed' | 'expired';

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

class EmergencyContactDto {
  @ApiProperty({ description: 'Emergency contact name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Relationship' })
  @IsString()
  relationship: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;
}

class BankingInfoDto {
  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  accountHolderName: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'Routing number' })
  @IsString()
  routingNumber: string;

  @ApiProperty({ description: 'Bank name' })
  @IsString()
  bankName: string;

  @ApiProperty({ description: 'Account type' })
  @IsString()
  accountType: 'checking' | 'savings';
}

class TaxInfoDto {
  @ApiProperty({ description: 'Tax ID' })
  @IsString()
  taxId: string;

  @ApiProperty({ description: 'Tax ID type' })
  @IsString()
  taxIdType: 'ssn' | 'ein' | 'other';

  @ApiPropertyOptional({ description: 'Business name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Business address' })
  @IsOptional()
  @IsString()
  businessAddress?: string;
}

export class CreateProfessionalDto {
  @ApiProperty({ description: 'User ID (must be a professional user)' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Business name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ description: 'Professional title or designation' })
  @IsString()
  professionalTitle: string;

  @ApiPropertyOptional({ description: 'Professional bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Service category', enum: ServiceCategory })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiPropertyOptional({ description: 'Professional status', enum: ProfessionalStatus, default: ProfessionalStatus.PENDING })
  @IsOptional()
  @IsEnum(ProfessionalStatus)
  status?: ProfessionalStatus;

  @ApiPropertyOptional({ description: 'Years of experience' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @ApiPropertyOptional({ description: 'Certifications', type: [CertificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  @ApiPropertyOptional({ description: 'Portfolio images', type: [PortfolioImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioImageDto)
  portfolioImages?: PortfolioImageDto[];

  @ApiProperty({ description: 'Service areas', type: [ServiceAreaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaDto)
  serviceAreas: ServiceAreaDto[];

  @ApiPropertyOptional({ description: 'Travel mode', enum: TravelMode, default: TravelMode.BOTH })
  @IsOptional()
  @IsEnum(TravelMode)
  travelMode?: TravelMode;

  @ApiPropertyOptional({ description: 'Base travel fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseTravelFee?: number;

  @ApiPropertyOptional({ description: 'Travel fee per kilometer' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFeePerKm?: number;

  @ApiPropertyOptional({ description: 'Maximum travel distance in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  maxTravelDistance?: number;

  @ApiProperty({ description: 'Working hours' })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  @ApiPropertyOptional({ description: 'Contact preferences' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContactPreferencesDto)
  contactPreferences?: ContactPreferencesDto;

  @ApiPropertyOptional({ description: 'Insurance information' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InsuranceInfoDto)
  insuranceInfo?: InsuranceInfoDto;

  @ApiPropertyOptional({ description: 'Background check information' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BackgroundCheckDto)
  backgroundCheck?: BackgroundCheckDto;

  @ApiPropertyOptional({ description: 'Emergency contact' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiPropertyOptional({ description: 'Banking information' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BankingInfoDto)
  bankingInfo?: BankingInfoDto;

  @ApiPropertyOptional({ description: 'Tax information' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TaxInfoDto)
  taxInfo?: TaxInfoDto;
}
