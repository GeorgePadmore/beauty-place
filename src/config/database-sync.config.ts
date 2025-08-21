import { ConfigService } from '@nestjs/config';

export interface DatabaseSyncConfig {
  syncSchema: boolean;
  dropSchema: boolean;
  runMigrations: boolean;
  runSeeds: boolean;
}

export const getDatabaseSyncConfig = (configService: ConfigService): DatabaseSyncConfig => {
  const environment = configService.get<string>('NODE_ENV', 'development');
  
  switch (environment) {
    case 'development':
      return {
        syncSchema: true,      // Auto-sync schema from entities
        dropSchema: false,     // Don't drop schema
        runMigrations: false,  // Don't run migrations in dev
        runSeeds: true,        // Run seeds for development data
      };
    
    case 'staging':
      return {
        syncSchema: false,     // Don't auto-sync in staging
        dropSchema: false,     // Don't drop schema
        runMigrations: true,   // Run migrations
        runSeeds: true,        // Run seeds for staging data
      };
    
    case 'production':
      return {
        syncSchema: false,     // Never auto-sync in production
        dropSchema: false,     // Never drop schema in production
        runMigrations: true,   // Always run migrations
        runSeeds: false,       // Never run seeds in production
      };
    
    default:
      return {
        syncSchema: false,
        dropSchema: false,
        runMigrations: true,
        runSeeds: false,
      };
  }
};
