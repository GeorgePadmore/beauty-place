import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseSyncConfig } from '../config/database-sync.config';

@Injectable()
export class DatabaseSyncService {
  private readonly logger = new Logger(DatabaseSyncService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  /**
   * Sync database schema from entities
   */
  async syncSchema(): Promise<void> {
    const syncConfig = getDatabaseSyncConfig(this.configService);
    
    if (!syncConfig.syncSchema) {
      this.logger.log('Schema synchronization is disabled for this environment');
      return;
    }

    try {
      this.logger.log('Starting database schema synchronization...');
      
      // Drop schema if configured
      if (syncConfig.dropSchema) {
        this.logger.warn('Dropping existing schema...');
        await this.dataSource.dropDatabase();
      }

      // Run migrations if configured
      if (syncConfig.runMigrations) {
        this.logger.log('Running database migrations...');
        await this.dataSource.runMigrations();
      }

      // Run seeds if configured
      if (syncConfig.runSeeds) {
        this.logger.log('Running database seeds...');
        await this.runSeeds();
      }

      this.logger.log('Database schema synchronization completed successfully');
    } catch (error) {
      this.logger.error('Database schema synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Run database seeds
   */
  private async runSeeds(): Promise<void> {
    try {
      // Insert default pricing configuration
      const pricingConfigQuery = `
        INSERT INTO pricing_config (pricing_type, value, name, description, unit, is_active) 
        VALUES 
          ('platform_fee', 15.0, 'Platform Fee', 'Default platform fee percentage for all transactions', 'percentage', true),
          ('withdrawal_fee', 1.0, 'Withdrawal Fee', 'Processing fee for bank transfers', 'percentage', true),
          ('processing_fee', 2.9, 'Processing Fee', 'Stripe processing fee percentage', 'percentage', true),
          ('minimum_withdrawal', 10.00, 'Minimum Withdrawal', 'Minimum amount for withdrawal requests', 'fixed_amount', true),
          ('maximum_withdrawal', 10000.00, 'Maximum Withdrawal', 'Maximum amount for withdrawal requests', 'fixed_amount', true)
        ON CONFLICT (pricing_type) DO NOTHING;
      `;

      await this.dataSource.query(pricingConfigQuery);
      this.logger.log('Pricing configuration seeds completed');

      // Insert user seed data
      const userSeedQuery = `
        INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_email_verified, is_active, is_deleted, created_at, updated_at) VALUES
        (
          '550e8400-e29b-41d4-a716-446655440001',
          'john.doe@example.com',
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG',
          'client',
          'John',
          'Doe',
          '+1234567890',
          true,
          true,
          false,
          NOW(),
          NOW()
        ),
        (
          '550e8400-e29b-41d4-a716-446655440002',
          'jane.smith@example.com',
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG',
          'client',
          'Jane',
          'Smith',
          '+1234567891',
          true,
          true,
          false,
          NOW(),
          NOW()
        ),
        (
          '550e8400-e29b-41d4-a716-446655440004',
          'sarah.beauty@example.com',
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG',
          'professional',
          'Sarah',
          'Beauty',
          '+1234567893',
          true,
          true,
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      await this.dataSource.query(userSeedQuery);
      this.logger.log('User seed data completed');

      // Insert professional seed data
      const professionalSeedQuery = `
        INSERT INTO professionals (
          id, user_id, business_name, professional_title, bio, description, category, status, verification_status,
          years_experience, service_areas, travel_mode, base_travel_fee, travel_fee_per_km, max_travel_distance,
          working_hours, average_rating, total_reviews, total_bookings, completion_rate, is_featured, is_premium,
          social_media, contact_preferences, insurance_info, background_check, emergency_contact, banking_info, tax_info,
          is_deleted, created_at, updated_at
        ) VALUES
        (
          '550e8400-e29b-41d4-a716-446655440010',
          '550e8400-e29b-41d4-a716-446655440004',
          'Sarah Beauty Studio',
          'Licensed Esthetician & Beauty Specialist',
          'Passionate beauty professional with 8+ years of experience in skincare, makeup, and beauty treatments.',
          'Specializing in facials, chemical peels, microdermabrasion, and anti-aging treatments. Certified in advanced skincare techniques and committed to helping clients achieve their beauty goals.',
          'beauty',
          'active',
          'verified',
          8,
          '[{"city": "New York", "state": "NY", "country": "USA", "postalCode": "10001", "radiusKm": 25, "travelFee": 15.00}]',
          'both',
          15.00,
          0.50,
          25.00,
          '{"monday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "tuesday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "wednesday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "thursday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "friday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "saturday": {"start": "10:00", "end": "16:00", "isAvailable": true}, "sunday": {"start": "10:00", "end": "16:00", "isAvailable": false}}',
          4.8,
          45,
          120,
          98.5,
          true,
          true,
          '{"instagram": "@sarahbeauty", "facebook": "Sarah Beauty Studio", "website": "https://sarahbeauty.com"}',
          '{"preferredContactMethod": "both", "responseTime": 2, "autoReplyMessage": "Thank you for your message. I will respond within 2 hours."}',
          '{"hasInsurance": true, "insuranceProvider": "Beauty Pro Insurance", "policyNumber": "BPI-2024-001", "expiryDate": "2025-12-31", "coverageAmount": 1000000}',
          '{"isCompleted": true, "completedDate": "2024-01-15", "expiresDate": "2027-01-15", "status": "passed", "notes": "Background check completed successfully"}',
          '{"name": "John Beauty", "relationship": "Spouse", "phone": "+1234567890", "email": "john@sarahbeauty.com"}',
          '{"accountHolderName": "Sarah Beauty", "accountNumber": "1234567890", "routingNumber": "021000021", "bankName": "Chase Bank", "accountType": "checking"}',
          '{"taxId": "12-3456789", "taxIdType": "ssn", "businessName": "Sarah Beauty Studio", "businessAddress": "123 Beauty St, New York, NY 10001"}',
          false,
          NOW(),
          NOW()
        ),
        (
          '550e8400-e29b-41d4-a716-446655440011',
          '550e8400-e29b-41d4-a716-446655440005',
          'Mike Stylist Mobile',
          'Master Hair Stylist & Grooming Expert',
          'Experienced hair stylist specializing in men''s cuts, styling, and grooming services.',
          'Offering professional haircuts, beard trims, styling, and grooming services. Available for home visits and salon appointments. Committed to delivering exceptional results and customer satisfaction.',
          'grooming',
          'active',
          'verified',
          12,
          '[{"city": "Los Angeles", "state": "CA", "country": "USA", "postalCode": "90210", "radiusKm": 30, "travelFee": 20.00}]',
          'home_visit',
          20.00,
          0.75,
          30.00,
          '{"monday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "tuesday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "wednesday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "thursday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "friday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "saturday": {"start": "09:00", "end": "17:00", "isAvailable": true}, "sunday": {"start": "09:00", "end": "17:00", "isAvailable": false}}',
          4.9,
          67,
          89,
          97.8,
          true,
          false,
          '{"instagram": "@mikestylist", "facebook": "Mike Stylist Mobile", "website": "https://mikestylist.com"}',
          '{"preferredContactMethod": "phone", "responseTime": 1, "autoReplyMessage": "Thanks for contacting Mike Stylist. I will call you back within 1 hour."}',
          '{"hasInsurance": true, "insuranceProvider": "Hair Pro Insurance", "policyNumber": "HPI-2024-002", "expiryDate": "2025-12-31", "coverageAmount": 500000}',
          '{"isCompleted": true, "completedDate": "2024-02-01", "expiresDate": "2027-02-01", "status": "passed", "notes": "Background check completed successfully"}',
          '{"name": "Lisa Stylist", "relationship": "Sister", "phone": "+1234567891", "email": "lisa@mikestylist.com"}',
          '{"accountHolderName": "Mike Stylist", "accountNumber": "0987654321", "routingNumber": "121000248", "bankName": "Bank of America", "accountType": "checking"}',
          '{"taxId": "98-7654321", "taxIdType": "ssn", "businessName": "Mike Stylist Mobile", "businessAddress": "456 Style Ave, Los Angeles, CA 90210"}',
          false,
          NOW(),
          NOW()
        ),
        (
          '550e8400-e29b-41d4-a716-446655440012',
          '550e8400-e29b-41d4-a716-446655440006',
          'Lisa Massage Therapy',
          'Licensed Massage Therapist & Wellness Coach',
          'Certified massage therapist with expertise in therapeutic massage, relaxation, and wellness.',
          'Specializing in Swedish massage, deep tissue massage, sports massage, and relaxation therapy. Committed to promoting wellness and helping clients achieve physical and mental balance.',
          'wellness',
          'inactive',
          'verified',
          6,
          '[{"city": "Chicago", "state": "IL", "country": "USA", "postalCode": "60601", "radiusKm": 20, "travelFee": 12.00]}',
          'both',
          12.00,
          0.60,
          20.00,
          '{"monday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "tuesday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "wednesday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "thursday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "friday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "saturday": {"start": "09:00", "end": "15:00", "isAvailable": false}, "sunday": {"start": "09:00", "end": "15:00", "isAvailable": false}}',
          4.7,
          34,
          56,
          96.4,
          false,
          false,
          '{"instagram": "@lisamassage", "facebook": "Lisa Massage Therapy", "website": "https://lisamassage.com"}',
          '{"preferredContactMethod": "email", "responseTime": 4, "autoReplyMessage": "Thank you for your message. I will respond within 4 hours."}',
          '{"hasInsurance": true, "insuranceProvider": "Wellness Pro Insurance", "policyNumber": "WPI-2024-003", "expiryDate": "2025-12-31", "coverageAmount": 750000}',
          '{"isCompleted": true, "completedDate": "2024-01-20", "expiresDate": "2027-01-20", "status": "passed", "notes": "Background check completed successfully"}',
          '{"name": "Tom Massage", "relationship": "Husband", "phone": "+1234567892", "email": "tom@lisamassage.com"}',
          '{"accountHolderName": "Lisa Massage", "accountNumber": "1122334455", "routingNumber": "071000013", "bankName": "Wells Fargo", "accountType": "checking"}',
          '{"taxId": "11-2233445", "taxIdType": "ssn", "businessName": "Lisa Massage Therapy", "businessAddress": "789 Wellness Blvd, Chicago, IL 60601"}',
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      await this.dataSource.query(professionalSeedQuery);
      this.logger.log('Professional seed data completed');
    } catch (error) {
      this.logger.error('Failed to run seeds:', error);
      throw error;
    }
  }

  /**
   * Get database connection status
   */
  async getConnectionStatus(): Promise<{ connected: boolean; error?: string }> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        return { connected: true };
      } else {
        return { connected: false, error: 'Database not initialized' };
      }
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Get database info
   */
  async getDatabaseInfo(): Promise<{
    database: string;
    host: string;
    port: number;
    version: string;
  }> {
    try {
      const result = await this.dataSource.query('SELECT version()');
      const version = result[0].version;
      
      const connectionOptions = this.dataSource.options as any;
      const url = new URL(connectionOptions.url);
      
      return {
        database: url.pathname.slice(1), // Remove leading slash
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        version: version,
      };
    } catch (error) {
      this.logger.error('Failed to get database info:', error);
      throw error;
    }
  }
}
