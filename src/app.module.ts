import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { ServicesModule } from './services/services.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { rateLimitConfig } from './common/config/rate-limit.config';

@Module({
  imports: [
    ThrottlerModule.forRoot(rateLimitConfig),
    ConfigModule, 
    DatabaseModule, 
    UsersModule, 
    AuthModule, 
    ProfessionalsModule, 
    ServicesModule, 
    AvailabilityModule, 
    BookingsModule, 
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
