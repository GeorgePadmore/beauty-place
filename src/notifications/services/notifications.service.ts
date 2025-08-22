import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus, NotificationCategory } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushNotificationService } from './push-notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { LoggerService } from '../../common/services/logger.service';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  recipient?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  scheduledFor?: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushNotificationService: PushNotificationService,
    private templateService: NotificationTemplateService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Create and send a notification
   */
  async createAndSend(createDto: CreateNotificationDto): Promise<Notification | null> {
    this.loggerService.debug('Creating and sending notification...', 'NotificationsService');

    try {
      // Check user preferences
      const preference = await this.getUserPreference(createDto.userId, createDto.type, createDto.category);
      if (!preference?.isEnabled()) {
        this.loggerService.debug('Notification disabled by user preference', 'NotificationsService');
        return null;
      }

      // Check quiet hours
      if (preference.isInQuietHours()) {
        this.loggerService.debug('Notification blocked by quiet hours', 'NotificationsService');
        return null;
      }

      // Create notification record
      const notification = this.notificationRepository.create({
        userId: createDto.userId,
        type: createDto.type,
        category: createDto.category,
        title: createDto.title,
        message: createDto.message,
        metadata: createDto.metadata,
        recipient: createDto.recipient || await this.getUserRecipient(createDto.userId, createDto.type),
        status: NotificationStatus.PENDING,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      // Send notification based on type
      await this.sendNotification(savedNotification, createDto);

      this.loggerService.success('Notification created and sent successfully', 'NotificationsService');
      return savedNotification;
    } catch (error) {
      this.loggerService.error('Failed to create and send notification', error.stack, 'NotificationsService');
      throw error;
    }
  }

  /**
   * Send notification using template
   */
  async sendTemplateNotification(
    userId: string,
    templateName: string,
    variables: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Notification | null> {
    this.loggerService.debug(`Sending template notification: ${templateName}`, 'NotificationsService');

    try {
      const template = await this.templateService.getTemplate(templateName);
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      const processedContent = template.replaceVariables(template.content, variables);
      const processedSubject = template.replaceVariables(template.subject, variables);

      const createDto: CreateNotificationDto = {
        userId,
        type: template.type,
        category: template.category,
        title: processedSubject,
        message: processedContent,
        metadata: { ...metadata, templateName, variables },
        templateName,
        templateVariables: variables,
      };

      return await this.createAndSend(createDto);
    } catch (error) {
      this.loggerService.error('Failed to send template notification', error.stack, 'NotificationsService');
      throw error;
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(
    userId: string,
    bookingData: {
      id: string;
      serviceName: string;
      startTime: Date;
      professionalName: string;
      totalPrice: number;
    }
  ): Promise<Notification | null> {
    return await this.sendTemplateNotification(
      userId,
      'booking_confirmation',
      {
        serviceName: bookingData.serviceName,
        startTime: bookingData.startTime.toLocaleDateString(),
        startTimeFormatted: bookingData.startTime.toLocaleString(),
        professionalName: bookingData.professionalName,
        totalPrice: `$${bookingData.totalPrice.toFixed(2)}`,
        bookingId: bookingData.id,
      },
      { bookingId: bookingData.id, category: 'booking' }
    );
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(
    userId: string,
    paymentData: {
      amount: number;
      serviceName: string;
      transactionId: string;
    }
  ): Promise<Notification | null> {
    return await this.sendTemplateNotification(
      userId,
      'payment_confirmation',
      {
        amount: `$${paymentData.amount.toFixed(2)}`,
        serviceName: paymentData.serviceName,
        transactionId: paymentData.transactionId,
      },
      { transactionId: paymentData.transactionId, category: 'payment' }
    );
  }

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(
    userId: string,
    reminderData: {
      serviceName: string;
      startTime: Date;
      professionalName: string;
      location: string;
    }
  ): Promise<Notification | null> {
    return await this.sendTemplateNotification(
      userId,
      'appointment_reminder',
      {
        serviceName: reminderData.serviceName,
        startTime: reminderData.startTime.toLocaleDateString(),
        startTimeFormatted: reminderData.startTime.toLocaleString(),
        professionalName: reminderData.professionalName,
        location: reminderData.location,
      },
      { category: 'reminder' }
    );
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: NotificationStatus
  ): Promise<{ notifications: Notification[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('notification.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    const [notifications, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { notifications, total, page, limit };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId, isDeleted: false }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.markAsRead();
    return await this.notificationRepository.save(notification);
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    return await this.preferenceRepository.find({
      where: { userId, isDeleted: false },
      order: { type: 'ASC', category: 'ASC' }
    });
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Array<{
      type: NotificationType;
      category: NotificationCategory;
      enabled: boolean;
      recipient?: string;
      schedule?: any;
    }>
  ): Promise<NotificationPreference[]> {
    const updatedPreferences: NotificationPreference[] = [];

    for (const pref of preferences) {
      let preference = await this.preferenceRepository.findOne({
        where: { userId, type: pref.type, category: pref.category }
      });

      if (!preference) {
        preference = this.preferenceRepository.create({
          userId,
          type: pref.type,
          category: pref.category,
          enabled: pref.enabled,
          recipient: pref.recipient,
          schedule: pref.schedule,
        });
      } else {
        Object.assign(preference, pref);
      }

      updatedPreferences.push(await this.preferenceRepository.save(preference));
    }

    return updatedPreferences;
  }

  // Private helper methods

  private async getUserPreference(
    userId: string,
    type: NotificationType,
    category: NotificationCategory
  ): Promise<NotificationPreference | null> {
    return await this.preferenceRepository.findOne({
      where: { userId, type, category, isDeleted: false }
    });
  }

  private async getUserRecipient(userId: string, type: NotificationType): Promise<string> {
    // This would typically get the user's email, phone, or device token
    // For now, return a placeholder
    return 'user@example.com';
  }

  private async sendNotification(notification: Notification, createDto: CreateNotificationDto): Promise<void> {
    try {
      switch (notification.type) {
        case NotificationType.EMAIL:
          await this.emailService.sendEmail(notification);
          break;
        case NotificationType.SMS:
          await this.smsService.sendSms(notification);
          break;
        case NotificationType.PUSH:
          await this.pushNotificationService.sendPushNotification(notification);
          break;
        case NotificationType.IN_APP:
          // In-app notifications are stored but not sent externally
          notification.markAsSent();
          await this.notificationRepository.save(notification);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }
    } catch (error) {
      notification.markAsFailed(error.message);
      await this.notificationRepository.save(notification);
      throw error;
    }
  }
}
