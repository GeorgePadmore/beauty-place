import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './controllers/services.controller';
import { ServicesService } from './services/services.service';
import { Service } from './entities/service.entity';
import { Professional } from '../professionals/entities/professional.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Professional]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
