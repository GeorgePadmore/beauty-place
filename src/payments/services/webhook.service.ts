import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WebhookEvent } from '../entities/webhook-event.entity';
import { ServiceAccountTransaction, TransactionStatus } from '../entities/service-account-transaction.entity';
import { Booking, PaymentStatus } from '../../bookings/entities/booking.entity';
import { LoggerService } from '../../common/services/logger.service';

// Mock Stripe webhook event types
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
}

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, any>;
  application_fee_amount?: number;
  transfer_data?: {
    destination: string;
    amount?: number;
  };
}

interface StripeTransfer {
  id: string;
  amount: number;
  currency: string;
  status: string;
  destination: string;
  metadata: Record<string, any>;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookEvent)
    private webhookEventRepository: Repository<WebhookEvent>,
    @InjectRepository(ServiceAccountTransaction)
    private transactionRepository: Repository<ServiceAccountTransaction>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Process Stripe webhook event
   */
  async processWebhook(
    payload: string,
    signature: string,
    endpointSecret: string,
  ): Promise<void> {
    this.loggerService.debug('Processing webhook...', 'WebhookService');

    try {
      // Verify webhook signature (mock for development)
      const event = this.verifyWebhookSignature(payload, signature, endpointSecret);
      
      // Check idempotency
      if (await this.isDuplicateEvent(event.id)) {
        this.loggerService.warn(`Duplicate webhook event: ${event.id}`, 'WebhookService');
        return;
      }

      // Store webhook event
      await this.storeWebhookEvent(event);

      // Process the event based on type
      await this.handleWebhookEvent(event);

      this.loggerService.success(`Webhook processed successfully: ${event.type}`, 'WebhookService');
    } catch (error) {
      this.loggerService.error('Webhook processing failed', error.stack, 'WebhookService');
      throw error;
    }
  }

  /**
   * Handle different webhook event types
   */
  private async handleWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as StripePaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as StripePaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await this.handlePaymentIntentCanceled(event.data.object as StripePaymentIntent);
        break;
      
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as StripeTransfer);
        break;
      
      case 'transfer.paid':
        await this.handleTransferPaid(event.data.object as StripeTransfer);
        break;
      
      case 'transfer.failed':
        await this.handleTransferFailed(event.data.object as StripeTransfer);
        break;
      
      default:
        this.loggerService.debug(`Unhandled webhook event type: ${event.type}`, 'WebhookService');
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: StripePaymentIntent): Promise<void> {
    this.loggerService.debug(`Processing payment intent succeeded: ${paymentIntent.id}`, 'WebhookService');

    // Find the transaction
    const transaction = await this.transactionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      relations: ['serviceAccount'],
    });

    if (!transaction) {
      this.loggerService.error(`Transaction not found for payment intent: ${paymentIntent.id}`, undefined, 'WebhookService');
      return;
    }

    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED;
    transaction.updatedAt = new Date();
    await this.transactionRepository.save(transaction);

    // Update booking payment status
    const booking = await this.bookingRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (booking) {
      booking.paymentStatus = PaymentStatus.PAID;
      await this.bookingRepository.save(booking);
    }

    this.loggerService.success(`Payment intent succeeded processed: ${paymentIntent.id}`, 'WebhookService');
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: StripePaymentIntent): Promise<void> {
    this.loggerService.debug(`Processing payment intent failed: ${paymentIntent.id}`, 'WebhookService');

    // Find the transaction
    const transaction = await this.transactionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (transaction) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = 'Payment failed';
      transaction.updatedAt = new Date();
      await this.transactionRepository.save(transaction);
    }

    // Update booking payment status
    const booking = await this.bookingRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (booking) {
      booking.paymentStatus = PaymentStatus.FAILED;
      await this.bookingRepository.save(booking);
    }

    this.loggerService.success(`Payment intent failed processed: ${paymentIntent.id}`, 'WebhookService');
  }

  /**
   * Handle canceled payment intent
   */
  private async handlePaymentIntentCanceled(paymentIntent: StripePaymentIntent): Promise<void> {
    this.loggerService.debug(`Processing payment intent canceled: ${paymentIntent.id}`, 'WebhookService');

    // Find the transaction
    const transaction = await this.transactionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (transaction) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = 'Payment canceled';
      transaction.updatedAt = new Date();
      await this.transactionRepository.save(transaction);
    }

    // Update booking payment status
    const booking = await this.bookingRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (booking) {
      booking.paymentStatus = PaymentStatus.FAILED; // Use FAILED for canceled payments
      await this.bookingRepository.save(booking);
    }

    this.loggerService.success(`Payment intent canceled processed: ${paymentIntent.id}`, 'WebhookService');
  }

  /**
   * Handle transfer created
   */
  private async handleTransferCreated(transfer: StripeTransfer): Promise<void> {
    this.loggerService.debug(`Processing transfer created: ${transfer.id}`, 'WebhookService');

    // Find the withdrawal request by transfer ID in metadata
    const withdrawal = await this.webhookEventRepository.findOne({
      where: { 
        eventType: 'transfer.created',
      },
    });

    if (withdrawal) {
      this.loggerService.debug(`Transfer created for withdrawal: ${transfer.id}`, 'WebhookService');
    }

    this.loggerService.success(`Transfer created processed: ${transfer.id}`, 'WebhookService');
  }

  /**
   * Handle transfer paid
   */
  private async handleTransferPaid(transfer: StripeTransfer): Promise<void> {
    this.loggerService.debug(`Processing transfer paid: ${transfer.id}`, 'WebhookService');

    // Find the withdrawal request by transfer ID in metadata
    const withdrawal = await this.webhookEventRepository.findOne({
      where: { 
        eventType: 'transfer.paid',
      },
    });

    if (withdrawal) {
      this.loggerService.debug(`Transfer paid for withdrawal: ${transfer.id}`, 'WebhookService');
    }

    this.loggerService.success(`Transfer paid processed: ${transfer.id}`, 'WebhookService');
  }

  /**
   * Handle transfer failed
   */
  private async handleTransferFailed(transfer: StripeTransfer): Promise<void> {
    this.loggerService.debug(`Processing transfer failed: ${transfer.id}`, 'WebhookService');

    // Find the withdrawal request by transfer ID in metadata
    const withdrawal = await this.webhookEventRepository.findOne({
      where: { 
        eventType: 'transfer.failed',
      },
    });

    if (withdrawal) {
      this.loggerService.debug(`Transfer failed for withdrawal: ${transfer.id}`, 'WebhookService');
    }

    this.loggerService.success(`Transfer failed processed: ${transfer.id}`, 'WebhookService');
  }

  /**
   * Verify webhook signature (mock for development)
   */
  private verifyWebhookSignature(
    payload: string,
    signature: string,
    endpointSecret: string,
  ): StripeWebhookEvent {
    // In production, this would verify the signature using Stripe's SDK
    // For development, we'll just parse the payload
    
    try {
      const event = JSON.parse(payload) as StripeWebhookEvent;
      
      // Basic validation
      if (!event.id || !event.type || !event.data) {
        throw new BadRequestException('Invalid webhook payload');
      }

      return event;
    } catch (error) {
      throw new BadRequestException('Invalid webhook payload format');
    }
  }

  /**
   * Check if webhook event is duplicate
   */
  private async isDuplicateEvent(eventId: string): Promise<boolean> {
    const existingEvent = await this.webhookEventRepository.findOne({
      where: { stripeEventId: eventId },
    });

    return !!existingEvent;
  }

  /**
   * Store webhook event for audit and idempotency
   */
  private async storeWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    const webhookEvent = this.webhookEventRepository.create({
      stripeEventId: event.id,
      eventType: event.type,
      eventData: event.data,
      processedAt: new Date(),
      metadata: {
        created: event.created,
        livemode: event.livemode,
        pending_webhooks: event.pending_webhooks,
        request_id: event.request.id,
        idempotency_key: event.request.idempotency_key,
      },
    });

    await this.webhookEventRepository.save(webhookEvent);
  }

  /**
   * Get webhook event by ID
   */
  async getWebhookEvent(eventId: string): Promise<WebhookEvent> {
    const event = await this.webhookEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Webhook event not found');
    }

    return event;
  }

  /**
   * List webhook events with pagination
   */
  async listWebhookEvents(
    page: number = 1,
    limit: number = 20,
    eventType?: string,
  ): Promise<{
    events: WebhookEvent[];
    total: number;
    page: number;
    limit: number;
  }> {
    const whereClause: any = {};
    if (eventType) {
      whereClause.eventType = eventType;
    }

    const [events, total] = await this.webhookEventRepository.findAndCount({
      where: whereClause,
      order: { processedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      events,
      total,
      page,
      limit,
    };
  }

  /**
   * Retry failed webhook event
   */
  async retryWebhookEvent(eventId: string): Promise<void> {
    const event = await this.getWebhookEvent(eventId);

    if (event.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts exceeded');
    }

    // Increment retry count
    event.retryCount = (event.retryCount || 0) + 1;
    event.lastRetryAt = new Date();
    await this.webhookEventRepository.save(event);

    // Reprocess the event
    try {
      await this.handleWebhookEvent({
        id: event.stripeEventId,
        type: event.eventType,
        data: { object: event.eventData },
        created: Math.floor(event.processedAt.getTime() / 1000),
        livemode: event.metadata?.livemode || false,
        pending_webhooks: event.metadata?.pending_webhooks || 0,
        request: {
          id: event.metadata?.request_id || '',
          idempotency_key: event.metadata?.idempotency_key || '',
        },
      });

      this.loggerService.success(`Webhook event retry successful: ${eventId}`, 'WebhookService');
    } catch (error) {
      this.loggerService.error(`Webhook event retry failed: ${eventId}`, error.stack, 'WebhookService');
      throw error;
    }
  }
}
