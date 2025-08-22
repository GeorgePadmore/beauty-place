import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './services/bookings.service';
import { BookingsController } from './controllers/bookings.controller';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Service } from '../services/entities/service.entity';
import { Availability } from '../availability/entities/availability.entity';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      User,
      Professional,
      Service,
      Availability
    ])
  ],
  controllers: [BookingsController],
  providers: [BookingsService, LoggerService],
  exports: [BookingsService]
})
export class BookingsModule {}
