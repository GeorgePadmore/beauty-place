import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { getDatabaseSyncConfig } from './database-sync.config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const syncConfig = getDatabaseSyncConfig(configService);
  
  return {
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: syncConfig.syncSchema, // Auto-sync in development
    dropSchema: syncConfig.dropSchema, // Drop schema if needed
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    migrations: syncConfig.runMigrations ? [__dirname + '/../database/migrations/*.sql'] : [],
    migrationsRun: syncConfig.runMigrations,
    extra: {
      max: 20,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    },
  };
};
