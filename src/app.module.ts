import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { ServicesModule } from './services/services.module';
import { AvailabilityModule } from './availability/availability.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UsersModule, AuthModule, ProfessionalsModule, ServicesModule, AvailabilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
