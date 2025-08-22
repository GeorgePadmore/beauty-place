import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { WebhookService } from './services/webhook.service';
import { ServiceAccount } from './entities/service-account.entity';
import { ServiceAccountTransaction } from './entities/service-account-transaction.entity';
import { WithdrawalRequest } from './entities/withdrawal-request.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { PricingConfig } from './entities/pricing-config.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { User } from '../users/entities/user.entity';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceAccount,
      ServiceAccountTransaction,
      WithdrawalRequest,
      WebhookEvent,
      PricingConfig,
      Booking,
      Professional,
      User,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, WebhookService, LoggerService],
  exports: [PaymentsService, WebhookService],
})
export class PaymentsModule {}
