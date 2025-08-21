import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalsController } from './controllers/professionals.controller';
import { ProfessionalsService } from './services/professionals.service';
import { Professional } from './entities/professional.entity';
import { User } from '../users/entities/user.entity';
import { ServiceAccount } from '../payments/entities/service-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professional, User, ServiceAccount]),
  ],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService],
})
export class ProfessionalsModule {}
