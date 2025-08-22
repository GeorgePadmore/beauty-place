import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';
import { Professional } from '../professionals/entities/professional.entity';
import { Service } from '../services/entities/service.entity';
import { Availability } from '../availability/entities/availability.entity';
import { User } from '../users/entities/user.entity';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Professional,
      Service,
      Availability,
      User,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService, LoggerService],
  exports: [SearchService],
})
export class SearchModule {}
