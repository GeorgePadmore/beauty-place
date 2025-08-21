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
