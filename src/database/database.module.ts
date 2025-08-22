/* eslint-disable no-undef */
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../config/database.config';
import { DatabaseSyncService } from './database-sync.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseSyncService],
  exports: [DatabaseSyncService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly databaseSyncService: DatabaseSyncService) {}

  async onModuleInit() {
    try {
      await this.databaseSyncService.syncSchema();
    } catch (error) {
      console.error('Database sync failed during startup:', error);
      // Don't throw error to allow application to continue
    }
  }
}
