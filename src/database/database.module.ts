import { Module } from '@nestjs/common';
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
export class DatabaseModule {}
