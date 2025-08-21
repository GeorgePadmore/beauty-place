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
