import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { 
  CreatePaymentIntentDto, 
  PaymentIntentResponseDto, 
  PaymentIntentStatus,
  ConfirmPaymentDto,
  CreateWithdrawalRequestDto,
  UpdateWithdrawalRequestDto,
  WithdrawalMethod
} from '../dto';
import { ServiceAccount } from '../entities/service-account.entity';
import { ServiceAccountTransaction, TransactionType, TransactionStatus } from '../entities/service-account-transaction.entity';
import { WithdrawalRequest } from '../entities/withdrawal-request.entity';
import { PricingConfig, PricingType } from '../entities/pricing-config.entity';
import { Booking, PaymentStatus } from '../../bookings/entities/booking.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { User } from '../../users/entities/user.entity';
import { LoggerService } from '../../common/services/logger.service';

// Mock Stripe types for development
interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  payment_method_types: string[];
  metadata: Record<string, any>;
  application_fee_amount?: number;
  capture_method: string;
  confirmation_method: string;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  created: number;
  livemode: boolean;
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
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(ServiceAccount)
    private serviceAccountRepository: Repository<ServiceAccount>,
    @InjectRepository(ServiceAccountTransaction)
    private transactionRepository: Repository<ServiceAccountTransaction>,
    @InjectRepository(WithdrawalRequest)
    private withdrawalRepository: Repository<WithdrawalRequest>,
    @InjectRepository(PricingConfig)
    private pricingConfigRepository: Repository<PricingConfig>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Create a payment intent for a booking
   */
  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
    clientId: string,
  ): Promise<PaymentIntentResponseDto> {
    this.loggerService.debug('Creating payment intent...', 'PaymentsService');

    // Validate booking exists and belongs to client
    const booking = await this.bookingRepository.findOne({
      where: { id: createPaymentIntentDto.bookingId, isDeleted: false },
      relations: ['client', 'professional', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== clientId) {
      throw new ForbiddenException('You can only create payment intents for your own bookings');
    }

    // Validate amount matches booking total
    if (createPaymentIntentDto.amount !== booking.totalPriceCents) {
      throw new BadRequestException('Payment amount must match booking total');
    }

    // Get platform fee configuration
    const platformFeeConfig = await this.getPlatformFeeConfig();
    const platformFeeAmount = this.calculatePlatformFee(
      createPaymentIntentDto.amount,
      platformFeeConfig.value,
    );

    // Create mock Stripe payment intent
    const stripePaymentIntent = await this.createMockStripePaymentIntent(
      createPaymentIntentDto,
      platformFeeAmount,
    );

    // Create service account transaction record
    await this.createTransactionRecord(
      booking.professionalId,
      booking.id,
      stripePaymentIntent.id,
      createPaymentIntentDto.amount,
      platformFeeAmount,
      TransactionType.PAYMENT,
    );

    // Update booking with payment intent ID
    booking.stripePaymentIntentId = stripePaymentIntent.id;
    await this.bookingRepository.save(booking);

    this.loggerService.success('Payment intent created successfully', 'PaymentsService');

    return this.mapToPaymentIntentResponse(stripePaymentIntent, createPaymentIntentDto.bookingId);
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(
    confirmPaymentDto: ConfirmPaymentDto,
    clientId: string,
  ): Promise<PaymentIntentResponseDto> {
    this.loggerService.debug('Confirming payment...', 'PaymentsService');

    // Validate payment intent exists and belongs to client's booking
    const booking = await this.bookingRepository.findOne({
      where: { stripePaymentIntentId: confirmPaymentDto.paymentIntentId, isDeleted: false },
      relations: ['client', 'professional', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Payment intent not found');
    }

    if (booking.clientId !== clientId) {
      throw new ForbiddenException('You can only confirm payments for your own bookings');
    }

    // Mock Stripe payment confirmation
    const confirmedPaymentIntent = await this.confirmMockStripePayment(confirmPaymentDto.paymentIntentId);

    // Update transaction status
    await this.updateTransactionStatus(
      confirmedPaymentIntent.id,
      TransactionStatus.COMPLETED,
    );

    // Update booking payment status
    booking.paymentStatus = PaymentStatus.PAID;
    await this.bookingRepository.save(booking);

    // Process professional payout
    await this.processProfessionalPayout(booking);

    this.loggerService.success('Payment confirmed successfully', 'PaymentsService');

    return this.mapToPaymentIntentResponse(confirmedPaymentIntent, booking.id);
  }

  /**
   * Get payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string, userId: string): Promise<PaymentIntentResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId, isDeleted: false },
      relations: ['client', 'professional'],
    });

    if (!booking) {
      throw new NotFoundException('Payment intent not found');
    }

    // Check if user has access to this payment intent
    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Mock Stripe payment intent retrieval
    const stripePaymentIntent = await this.getMockStripePaymentIntent(paymentIntentId);

    return this.mapToPaymentIntentResponse(stripePaymentIntent, booking.id);
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string, userId: string): Promise<PaymentIntentResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId, isDeleted: false },
      relations: ['client', 'professional'],
    });

    if (!booking) {
      throw new NotFoundException('Payment intent not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('Only the client can cancel payment intents');
    }

    // Mock Stripe payment intent cancellation
    const cancelledPaymentIntent = await this.cancelMockStripePayment(paymentIntentId);

    // Update transaction status
    await this.updateTransactionStatus(
      cancelledPaymentIntent.id,
      TransactionStatus.FAILED,
    );

    return this.mapToPaymentIntentResponse(cancelledPaymentIntent, booking.id);
  }

  /**
   * Create withdrawal request
   */
  async createWithdrawalRequest(
    createWithdrawalDto: CreateWithdrawalRequestDto,
    professionalId: string,
  ): Promise<WithdrawalRequest> {
    this.loggerService.debug('Creating withdrawal request...', 'PaymentsService');

    // Validate professional has sufficient balance
    const serviceAccount = await this.serviceAccountRepository.findOne({
      where: { professionalId, isActive: true, isDeleted: false },
    });

    if (!serviceAccount) {
      throw new NotFoundException('Service account not found');
    }

    if (!serviceAccount.canWithdraw(createWithdrawalDto.amount)) {
      throw new BadRequestException('Insufficient balance or account not eligible for withdrawal');
    }

    // Check minimum withdrawal amount
    const minWithdrawalConfig = await this.getMinimumWithdrawalConfig();
    if (createWithdrawalDto.amount < minWithdrawalConfig.value * 100) { // Convert to cents
      throw new BadRequestException(`Minimum withdrawal amount is $${minWithdrawalConfig.value}`);
    }

    // Create withdrawal request
    const withdrawalRequest = this.withdrawalRepository.create({
      serviceAccountId: serviceAccount.id,
      requestedAmount: createWithdrawalDto.amount / 100, // Convert cents to dollars
      approvedAmount: createWithdrawalDto.amount / 100,
      processingFee: 0, // Will be calculated based on config
      netAmount: createWithdrawalDto.amount / 100,
      withdrawalMethod: createWithdrawalDto.method as any, // Cast to match enum
      status: 'pending' as any, // Cast to match enum
      stripeTransferId: undefined,
      bankAccountId: createWithdrawalDto.paymentMethodId,
      paypalEmail: undefined,
      bankAccountDetails: undefined,
      approvedAt: undefined,
      processedAt: undefined,
      completedAt: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
      adminNotes: undefined,
      userNotes: createWithdrawalDto.notes || undefined,
      metadata: {
        preferredDate: createWithdrawalDto.preferredDate,
        originalAmount: createWithdrawalDto.amount,
      },
    });

    const savedWithdrawal = await this.withdrawalRepository.save(withdrawalRequest);

    this.loggerService.success('Withdrawal request created successfully', 'PaymentsService');

    return savedWithdrawal;
  }

  /**
   * Update withdrawal request (admin only)
   */
  async updateWithdrawalRequest(
    withdrawalId: string,
    updateDto: UpdateWithdrawalRequestDto,
    adminId: string,
  ): Promise<WithdrawalRequest> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['serviceAccount'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    // Update withdrawal
    Object.assign(withdrawal, updateDto);

    if (updateDto.status === 'approved') {
      withdrawal.approvedAt = new Date();
    } else if (updateDto.status === 'processing') {
      withdrawal.processedAt = new Date();
    } else if (updateDto.status === 'completed') {
      withdrawal.completedAt = new Date();
      // Process the actual payout
      await this.processWithdrawalPayout(withdrawal);
    }

    return await this.withdrawalRepository.save(withdrawal);
  }

  /**
   * Get professional's service account
   */
  async getServiceAccount(professionalId: string, requestingUserId: string): Promise<ServiceAccount> {
    const serviceAccount = await this.serviceAccountRepository.findOne({
      where: { professionalId, isDeleted: false },
      relations: ['transactions', 'withdrawalRequests'],
    });

    if (!serviceAccount) {
      throw new NotFoundException('Service account not found');
    }

    // Check ownership
    if (serviceAccount.professionalId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    return serviceAccount;
  }

  /**
   * Get professional's transaction history
   */
  async getTransactionHistory(
    professionalId: string,
    requestingUserId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    transactions: ServiceAccountTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Check ownership
    if (professionalId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { serviceAccount: { professionalId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['booking'],
    });

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  // Private helper methods

  private async getPlatformFeeConfig(): Promise<PricingConfig> {
    let config = await this.pricingConfigRepository.findOne({
      where: { pricingType: PricingType.PLATFORM_FEE, isActive: true },
    });

    if (!config) {
      // Create default platform fee config
      config = this.pricingConfigRepository.create({
        pricingType: PricingType.PLATFORM_FEE,
        value: 15.0, // 15%
        name: 'Platform Fee',
        description: 'Default platform fee percentage',
        unit: 'percentage',
        isActive: true,
      });
      await this.pricingConfigRepository.save(config);
    }

    return config;
  }

  private async getMinimumWithdrawalConfig(): Promise<PricingConfig> {
    let config = await this.pricingConfigRepository.findOne({
      where: { pricingType: PricingType.MINIMUM_WITHDRAWAL, isActive: true },
    });

    if (!config) {
      // Create default minimum withdrawal config
      config = this.pricingConfigRepository.create({
        pricingType: PricingType.MINIMUM_WITHDRAWAL,
        value: 25.0, // $25.00
        name: 'Minimum Withdrawal',
        description: 'Minimum withdrawal amount',
        unit: 'fixed_amount',
        isActive: true,
      });
      await this.pricingConfigRepository.save(config);
    }

    return config;
  }

  private calculatePlatformFee(amount: number, feePercentage: number): number {
    return Math.round((amount * feePercentage) / 100);
  }

  private async createMockStripePaymentIntent(
    dto: CreatePaymentIntentDto,
    platformFeeAmount: number,
  ): Promise<StripePaymentIntent> {
    // Mock Stripe API call
    const paymentIntent: StripePaymentIntent = {
      id: `pi_${uuidv4().replace(/-/g, '').substring(0, 24)}`,
      amount: dto.amount,
      currency: dto.currency,
      status: PaymentIntentStatus.REQUIRES_PAYMENT_METHOD,
      client_secret: `pi_${uuidv4().replace(/-/g, '').substring(0, 24)}_secret_${uuidv4().replace(/-/g, '').substring(0, 24)}`,
      payment_method_types: dto.paymentMethodTypes || ['card'],
      metadata: {
        ...dto.metadata,
        booking_id: dto.bookingId,
        platform_fee_amount: platformFeeAmount,
      },
      application_fee_amount: platformFeeAmount,
      capture_method: dto.captureMethod || 'automatic',
      confirmation_method: dto.confirmationMethod || 'automatic',
      statement_descriptor: dto.statementDescriptor || 'BEAUTY PLACE',
      statement_descriptor_suffix: dto.statementDescriptorSuffix || 'SERVICE',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    };

    return paymentIntent;
  }

  private async confirmMockStripePayment(paymentIntentId: string): Promise<StripePaymentIntent> {
    // Mock Stripe payment confirmation
    const paymentIntent: StripePaymentIntent = {
      id: paymentIntentId,
      amount: 2000, // Mock amount
      currency: 'usd',
      status: PaymentIntentStatus.SUCCEEDED,
      client_secret: `${paymentIntentId}_secret_confirmed`,
      payment_method_types: ['card'],
      metadata: { confirmed: true },
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      statement_descriptor: 'BEAUTY PLACE',
      statement_descriptor_suffix: 'SERVICE',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    };

    return paymentIntent;
  }

  private async getMockStripePaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    // Mock Stripe payment intent retrieval
    const paymentIntent: StripePaymentIntent = {
      id: paymentIntentId,
      amount: 2000, // Mock amount
      currency: 'usd',
      status: PaymentIntentStatus.REQUIRES_PAYMENT_METHOD,
      client_secret: `${paymentIntentId}_secret_retrieved`,
      payment_method_types: ['card'],
      metadata: { retrieved: true },
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      statement_descriptor: 'BEAUTY PLACE',
      statement_descriptor_suffix: 'SERVICE',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    };

    return paymentIntent;
  }

  private async cancelMockStripePayment(paymentIntentId: string): Promise<StripePaymentIntent> {
    // Mock Stripe payment intent cancellation
    const paymentIntent: StripePaymentIntent = {
      id: paymentIntentId,
      amount: 2000, // Mock amount
      currency: 'usd',
      status: PaymentIntentStatus.CANCELED,
      client_secret: `${paymentIntentId}_secret_cancelled`,
      payment_method_types: ['card'],
      metadata: { cancelled: true },
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      statement_descriptor: 'BEAUTY PLACE',
      statement_descriptor_suffix: 'SERVICE',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    };

    return paymentIntent;
  }

  private async createTransactionRecord(
    professionalId: string,
    bookingId: string,
    stripePaymentIntentId: string,
    amount: number,
    platformFee: number,
    transactionType: TransactionType,
  ): Promise<ServiceAccountTransaction> {
    // Get or create service account
    let serviceAccount = await this.serviceAccountRepository.findOne({
      where: { professionalId },
    });

    if (!serviceAccount) {
      serviceAccount = this.serviceAccountRepository.create({
        professionalId,
        grossBalance: 0,
        netBalance: 0,
        isActive: true,
      });
      await this.serviceAccountRepository.save(serviceAccount);
    }

    const transaction = this.transactionRepository.create({
      serviceAccountId: serviceAccount.id,
      processingId: uuidv4(),
      stripePaymentIntentId,
      bookingId,
      grossBalanceBefore: serviceAccount.grossBalance,
      grossBalanceAfter: serviceAccount.grossBalance,
      netBalanceBefore: serviceAccount.netBalance,
      netBalanceAfter: serviceAccount.netBalance,
      grossAmount: amount,
      netAmount: amount - platformFee,
      platformFee,
      stripeFee: 0, // Will be updated when payment is confirmed
      transactionType,
      status: TransactionStatus.PENDING,
      description: `Payment for booking ${bookingId}`,
      metadata: { booking_id: bookingId },
    });

    return await this.transactionRepository.save(transaction);
  }

  private async updateTransactionStatus(
    stripePaymentIntentId: string,
    status: TransactionStatus,
  ): Promise<void> {
    await this.transactionRepository.update(
      { stripePaymentIntentId },
      { status, updatedAt: new Date() },
    );
  }

  private async processProfessionalPayout(booking: Booking): Promise<void> {
    const serviceAccount = await this.serviceAccountRepository.findOne({
      where: { professionalId: booking.professionalId },
    });

    if (!serviceAccount) {
      this.loggerService.error('Service account not found for payout', undefined, 'PaymentsService');
      return;
    }

    // Calculate net amount (after platform fee)
    const platformFee = Math.round((booking.totalPriceCents * 15) / 100); // 15% platform fee
    const netAmount = booking.totalPriceCents - platformFee;

    // Update service account balances
    serviceAccount.grossBalance += Math.round((booking.totalPriceCents / 100) * 100) / 100; // Convert cents to dollars with 2 decimal precision
    serviceAccount.netBalance += Math.round((netAmount / 100) * 100) / 100; // Convert cents to dollars with 2 decimal precision
    serviceAccount.lastTransactionAt = new Date();

    await this.serviceAccountRepository.save(serviceAccount);

    // Update transaction record
    await this.transactionRepository.update(
      { stripePaymentIntentId: booking.stripePaymentIntentId },
      {
        status: TransactionStatus.COMPLETED,
        grossBalanceAfter: serviceAccount.grossBalance,
        netBalanceAfter: serviceAccount.netBalance,
        updatedAt: new Date(),
      },
    );

    this.loggerService.success('Professional payout processed successfully', 'PaymentsService');
  }

  private async processWithdrawalPayout(withdrawal: WithdrawalRequest): Promise<void> {
    // Mock Stripe transfer creation
    const transfer: StripeTransfer = {
      id: `tr_${uuidv4().replace(/-/g, '').substring(0, 24)}`,
      amount: Math.round(withdrawal.requestedAmount * 100), // Convert dollars to cents
      currency: 'usd',
      status: 'paid',
      destination: withdrawal.bankAccountId,
      metadata: { withdrawal_id: withdrawal.id },
    };

    // Update withdrawal with transfer ID
    withdrawal.stripeTransferId = transfer.id;
    await this.withdrawalRepository.save(withdrawal);

    // Update service account balance
    const serviceAccount = await this.serviceAccountRepository.findOne({
      where: { id: withdrawal.serviceAccountId },
    });

    if (serviceAccount) {
      const currentNetBalance = serviceAccount.netBalance || 0;
      serviceAccount.netBalance = Math.round((currentNetBalance - withdrawal.requestedAmount) * 100) / 100;
      serviceAccount.lastWithdrawalAt = new Date();
      await this.serviceAccountRepository.save(serviceAccount);
    }

    this.loggerService.success('Withdrawal payout processed successfully', 'PaymentsService');
  }

  private mapToPaymentIntentResponse(
    stripePaymentIntent: StripePaymentIntent,
    bookingId: string,
  ): PaymentIntentResponseDto {
    return {
      id: stripePaymentIntent.id,
      amount: stripePaymentIntent.amount,
      currency: stripePaymentIntent.currency,
      status: stripePaymentIntent.status as PaymentIntentStatus,
      bookingId,
      clientSecret: stripePaymentIntent.client_secret,
      paymentMethodTypes: stripePaymentIntent.payment_method_types,
      metadata: stripePaymentIntent.metadata,
      applicationFeeAmount: stripePaymentIntent.application_fee_amount,
      captureMethod: stripePaymentIntent.capture_method,
      confirmationMethod: stripePaymentIntent.confirmation_method,
      statementDescriptor: stripePaymentIntent.statement_descriptor,
      statementDescriptorSuffix: stripePaymentIntent.statement_descriptor_suffix,
      createdAt: new Date(stripePaymentIntent.created * 1000),
      livemode: stripePaymentIntent.livemode,
      amountFormatted: `$${(stripePaymentIntent.amount / 100).toFixed(2)}`,
      applicationFeeFormatted: stripePaymentIntent.application_fee_amount
        ? `$${(stripePaymentIntent.application_fee_amount / 100).toFixed(2)}`
        : '$0.00',
    };
  }
}
