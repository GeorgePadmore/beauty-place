import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ServiceAccount } from '../entities/service-account.entity';
import { ServiceAccountTransaction, TransactionType, TransactionStatus } from '../entities/service-account-transaction.entity';
import { WithdrawalRequest, WithdrawalStatus } from '../entities/withdrawal-request.entity';
import { PricingConfig, PricingType } from '../entities/pricing-config.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);

  constructor(
    @InjectRepository(ServiceAccount)
    private serviceAccountRepository: Repository<ServiceAccount>,
    @InjectRepository(ServiceAccountTransaction)
    private transactionRepository: Repository<ServiceAccountTransaction>,
    @InjectRepository(WithdrawalRequest)
    private withdrawalRequestRepository: Repository<WithdrawalRequest>,
    @InjectRepository(PricingConfig)
    private pricingConfigRepository: Repository<PricingConfig>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get platform fee percentage from pricing config
   */
  private async getPlatformFeePercentage(): Promise<number> {
    const config = await this.pricingConfigRepository.findOne({
      where: { pricingType: PricingType.PLATFORM_FEE, isActive: true },
    });
    return config ? config.getValueAsPercentage() : 0.15; // Default 15%
  }

  /**
   * Get minimum withdrawal amount from pricing config
   */
  private async getMinimumWithdrawalAmount(): Promise<number> {
    const config = await this.pricingConfigRepository.findOne({
      where: { pricingType: PricingType.MINIMUM_WITHDRAWAL, isActive: true },
    });
    return config ? config.getValueAsDecimal() : 10.0; // Default $10.00
  }

  /**
   * Process a successful booking payment
   */
  async processBookingPayment(booking: Booking): Promise<ServiceAccountTransaction> {
    return this.dataSource.transaction(async (manager) => {
      // Get or create service account
      let serviceAccount = await manager.findOne(ServiceAccount, {
        where: { professionalId: booking.professionalId },
      });

      if (!serviceAccount) {
        serviceAccount = manager.create(ServiceAccount, {
          professionalId: booking.professionalId,
          grossBalance: 0,
          netBalance: 0,
        });
        await manager.save(serviceAccount);
      }

      // Get platform fee percentage
      const platformFeePercentage = await this.getPlatformFeePercentage();

      // Calculate fees
      const grossAmount = booking.totalPriceCents / 100; // Convert cents to dollars
      const platformFee = serviceAccount.calculatePlatformFee(grossAmount, platformFeePercentage);
      const netAmount = serviceAccount.calculateNetAmount(grossAmount, platformFeePercentage);

      // Store current balances
      const balanceBefore = {
        gross: serviceAccount.grossBalance,
        net: serviceAccount.netBalance,
      };

      // Update balances
      serviceAccount.grossBalance += grossAmount;
      serviceAccount.netBalance += netAmount;

      await manager.save(serviceAccount);

      // Create transaction record
      const transaction = manager.create(ServiceAccountTransaction, {
        serviceAccountId: serviceAccount.id,
        processingId: uuidv4(),
        stripePaymentIntentId: booking.stripePaymentIntentId,
        bookingId: booking.id,
        grossBalanceBefore: balanceBefore.gross,
        grossBalanceAfter: serviceAccount.grossBalance,
        netBalanceBefore: balanceBefore.net,
        netBalanceAfter: serviceAccount.netBalance,
        grossAmount,
        netAmount,
        platformFee,
        stripeFee: 0, // Will be updated when Stripe webhook is processed
        transactionType: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        description: `Payment for booking #${booking.id}`,
      });

      return manager.save(transaction);
    });
  }

  /**
   * Process a refund
   */
  async processRefund(
    booking: Booking,
    refundAmount: number,
    reason: string,
  ): Promise<ServiceAccountTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const serviceAccount = await manager.findOne(ServiceAccount, {
        where: { professionalId: booking.professionalId },
      });

      if (!serviceAccount) {
        throw new BadRequestException('Service account not found');
      }

      const platformFeePercentage = await this.getPlatformFeePercentage();
      const platformFeeRefund = serviceAccount.calculatePlatformFee(refundAmount, platformFeePercentage);
      const netRefundAmount = refundAmount - platformFeeRefund;

      // Store current balances
      const balanceBefore = {
        gross: serviceAccount.grossBalance,
        net: serviceAccount.netBalance,
      };

      // Update balances
      serviceAccount.grossBalance -= refundAmount;
      serviceAccount.netBalance -= netRefundAmount;

      await manager.save(serviceAccount);

      // Create transaction record
      const transaction = manager.create(ServiceAccountTransaction, {
        serviceAccountId: serviceAccount.id,
        processingId: uuidv4(),
        bookingId: booking.id,
        grossBalanceBefore: balanceBefore.gross,
        grossBalanceAfter: serviceAccount.grossBalance,
        netBalanceBefore: balanceBefore.net,
        netBalanceAfter: serviceAccount.netBalance,
        grossAmount: refundAmount,
        netAmount: netRefundAmount,
        platformFee: platformFeeRefund,
        transactionType: TransactionType.REFUND,
        status: TransactionStatus.COMPLETED,
        description: `Refund for booking #${booking.id}: ${reason}`,
        notes: reason,
        processedAt: new Date(),
      });

      return manager.save(transaction);
    });
  }

  /**
   * Create a withdrawal request
   */
  async createWithdrawalRequest(
    professionalId: string,
    amount: number,
    method: string,
    notes?: string,
  ): Promise<WithdrawalRequest> {
    return this.dataSource.transaction(async (manager) => {
      const serviceAccount = await manager.findOne(ServiceAccount, {
        where: { professionalId },
      });

      if (!serviceAccount) {
        throw new BadRequestException('Service account not found');
      }

      const minimumAmount = await this.getMinimumWithdrawalAmount();

      if (!serviceAccount.canWithdraw(amount)) {
        throw new ConflictException(
          `Cannot withdraw $${amount}. Available balance: $${serviceAccount.availableBalanceDollars}`,
        );
      }

      if (amount < minimumAmount) {
        throw new ConflictException(
          `Minimum withdrawal amount is $${minimumAmount}`,
        );
      }

      // Calculate processing fee (example: 1% for bank transfers)
      const processingFee = method === 'bank_transfer' ? amount * 0.01 : 0;
      const netAmount = amount - processingFee;

      const withdrawalRequest = manager.create(WithdrawalRequest, {
        serviceAccountId: serviceAccount.id,
        requestedAmount: amount,
        approvedAmount: amount,
        processingFee,
        netAmount,
        withdrawalMethod: method as any, // Type assertion for now
        status: WithdrawalStatus.PENDING,
        userNotes: notes,
      });

      return manager.save(withdrawalRequest);
    });
  }

  /**
   * Process a withdrawal (approve and execute)
   */
  async processWithdrawal(
    withdrawalId: string,
    approvedAmount: number,
    adminNotes?: string,
  ): Promise<ServiceAccountTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const withdrawal = await manager.findOne(WithdrawalRequest, {
        where: { id: withdrawalId },
      });

      if (!withdrawal) {
        throw new BadRequestException('Withdrawal request not found');
      }

      if (!withdrawal.canBeCompleted()) {
        throw new ConflictException('Withdrawal request cannot be completed');
      }

      const serviceAccount = await manager.findOne(ServiceAccount, {
        where: { id: withdrawal.serviceAccountId },
      });

      if (!serviceAccount) {
        throw new BadRequestException('Service account not found');
      }

      if (approvedAmount > serviceAccount.availableBalance) {
        throw new ConflictException(
          `Approved amount exceeds available balance. Available: $${serviceAccount.availableBalanceDollars}`,
        );
      }

      // Complete withdrawal
      withdrawal.markAsCompleted();
      await manager.save(withdrawal);

      // Store current balances
      const balanceBefore = {
        gross: serviceAccount.grossBalance,
        net: serviceAccount.netBalance,
      };

      // Update balances
      serviceAccount.netBalance -= approvedAmount;

      await manager.save(serviceAccount);

      // Create transaction record
      const transaction = manager.create(ServiceAccountTransaction, {
        serviceAccountId: serviceAccount.id,
        processingId: uuidv4(),
        grossBalanceBefore: balanceBefore.gross,
        grossBalanceAfter: serviceAccount.grossBalance,
        netBalanceBefore: balanceBefore.net,
        netBalanceAfter: serviceAccount.netBalance,
        grossAmount: approvedAmount,
        netAmount: approvedAmount,
        platformFee: 0,
        transactionType: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
        description: `Withdrawal request #${withdrawal.id}`,
        notes: adminNotes,
        processedAt: new Date(),
      });

      return manager.save(transaction);
    });
  }

  /**
   * Get service account balance
   */
  async getServiceAccountBalance(professionalId: string): Promise<ServiceAccount> {
    const serviceAccount = await this.serviceAccountRepository.findOne({
      where: { professionalId },
    });

    if (!serviceAccount) {
      throw new BadRequestException('Service account not found');
    }

    return serviceAccount;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    serviceAccountId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ transactions: ServiceAccountTransaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { serviceAccountId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { transactions, total };
  }

  /**
   * Get withdrawal requests
   */
  async getWithdrawalRequests(
    serviceAccountId: string,
    status?: WithdrawalStatus,
  ): Promise<WithdrawalRequest[]> {
    const where: any = { serviceAccountId };
    if (status) {
      where.status = status;
    }

    return this.withdrawalRequestRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pricing configuration
   */
  async getPricingConfig(): Promise<PricingConfig[]> {
    return this.pricingConfigRepository.find({
      where: { isActive: true },
      order: { pricingType: 'ASC' },
    });
  }
}
