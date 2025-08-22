import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { AvailabilityService } from './services/availability.service';
import { AvailabilityController } from './controllers/availability.controller';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability, Professional]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, LoggerService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
