import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushNotificationService } from './services/push-notification.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, NotificationTemplate]),
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    PushNotificationService,
    NotificationTemplateService,
    LoggerService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
