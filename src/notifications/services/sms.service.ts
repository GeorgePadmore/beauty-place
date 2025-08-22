import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class SmsService {
  constructor(private readonly loggerService: LoggerService) {}

  async sendSms(notification: Notification): Promise<void> {
    this.loggerService.debug(`Sending SMS to: ${notification.recipient}`, 'SmsService');
    
    // Mock SMS sending - in production this would integrate with Twilio, AWS SNS, etc.
    this.loggerService.success(`SMS sent successfully to ${notification.recipient}`, 'SmsService');
    
    // Mark as sent
    notification.markAsSent();
  }
}
