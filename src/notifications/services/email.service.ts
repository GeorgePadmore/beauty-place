import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class EmailService {
  constructor(private readonly loggerService: LoggerService) {}

  async sendEmail(notification: Notification): Promise<void> {
    this.loggerService.debug(`Sending email to: ${notification.recipient}`, 'EmailService');
    
    // Mock email sending - in production this would integrate with SendGrid, AWS SES, etc.
    this.loggerService.success(`Email sent successfully to ${notification.recipient}`, 'EmailService');
    
    // Mark as sent
    notification.markAsSent();
  }
}
