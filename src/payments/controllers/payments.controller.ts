import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../users/entities/user.entity';

import { PaymentsService } from '../services/payments.service';
import { WebhookService } from '../services/webhook.service';
import {
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
  ConfirmPaymentDto,
  CreateWithdrawalRequestDto,
  UpdateWithdrawalRequestDto,
} from '../dto';
import { ServiceAccount } from '../entities/service-account.entity';
import { ServiceAccountTransaction } from '../entities/service-account-transaction.entity';
import { WithdrawalRequest } from '../entities/withdrawal-request.entity';
import { WebhookEvent } from '../entities/webhook-event.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post('payment-intents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Create a new payment intent for a booking. Only clients can create payment intents.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid amount or booking not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a client or does not own the booking',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @CurrentUser('id') clientId: string,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto, clientId);
  }

  @Post('payment-intents/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiOperation({
    summary: 'Confirm payment intent',
    description: 'Confirm a payment intent to complete the payment. Only clients can confirm payments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid payment intent',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a client or does not own the payment intent',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment intent not found',
  })
  async confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @CurrentUser('id') clientId: string,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.confirmPayment(confirmPaymentDto, clientId);
  }

  @Get('payment-intents/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get payment intent',
    description: 'Get payment intent details. Accessible by the client or professional involved.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent retrieved successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user does not have access to this payment intent',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment intent not found',
  })
  @ApiParam({
    name: 'paymentIntentId',
    description: 'Stripe payment intent ID',
    example: 'pi_3NkXvG2eZvKYlo2C1gF12345',
  })
  async getPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.getPaymentIntent(paymentIntentId, userId);
  }

  @Post('payment-intents/:paymentIntentId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiOperation({
    summary: 'Cancel payment intent',
    description: 'Cancel a payment intent. Only the client who created it can cancel it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent canceled successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a client or does not own the payment intent',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment intent not found',
  })
  @ApiParam({
    name: 'paymentIntentId',
    description: 'Stripe payment intent ID',
    example: 'pi_3NkXvG2eZvKYlo2C1gF12345',
  })
  async cancelPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.cancelPaymentIntent(paymentIntentId, userId);
  }

  @Post('withdrawals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @ApiOperation({
    summary: 'Create withdrawal request',
    description: 'Create a new withdrawal request. Only professionals can create withdrawal requests.',
  })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal request created successfully',
    type: WithdrawalRequest,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient balance or invalid amount',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a professional',
  })
  @ApiResponse({
    status: 404,
    description: 'Service account not found',
  })
  async createWithdrawalRequest(
    @Body() createWithdrawalDto: CreateWithdrawalRequestDto,
    @CurrentUser('id') professionalId: string,
  ): Promise<WithdrawalRequest> {
    return this.paymentsService.createWithdrawalRequest(createWithdrawalDto, professionalId);
  }

  @Get('service-accounts/:professionalId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get service account',
    description: 'Get professional service account details. Only the account owner can access it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service account retrieved successfully',
    type: ServiceAccount,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user does not own this service account',
  })
  @ApiResponse({
    status: 404,
    description: 'Service account not found',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'Professional user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  async getServiceAccount(
    @Param('professionalId') professionalId: string,
    @CurrentUser('id') requestingUserId: string,
  ): Promise<ServiceAccount> {
    return this.paymentsService.getServiceAccount(professionalId, requestingUserId);
  }

  @Get('service-accounts/:professionalId/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Get professional transaction history. Only the account owner can access it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: [ServiceAccountTransaction],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user does not own this service account',
  })
  @ApiResponse({
    status: 404,
    description: 'Service account not found',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'Professional user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
    example: 20,
  })
  async getTransactionHistory(
    @Param('professionalId') professionalId: string,
    @CurrentUser('id') requestingUserId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{
    transactions: ServiceAccountTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.paymentsService.getTransactionHistory(professionalId, requestingUserId, page, limit);
  }

  @Post('webhooks/stripe')
  @Public()
  @ApiOperation({
    summary: 'Stripe webhook endpoint',
    description: 'Receive and process Stripe webhook events. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid webhook payload',
  })
  async handleStripeWebhook(
    @Request() req: any,
    @Body() payload: any,
  ): Promise<void> {
    // In production, you would get the signature from headers
    const signature = req.headers['stripe-signature'] || 'mock-signature';
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'mock-secret';

    await this.webhookService.processWebhook(
      JSON.stringify(payload),
      signature,
      endpointSecret,
    );
  }

  @Get('webhooks/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'List webhook events',
    description: 'List all webhook events. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook events retrieved successfully',
    type: [WebhookEvent],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'eventType',
    description: 'Filter by event type',
    required: false,
    type: String,
    example: 'payment_intent.succeeded',
  })
  async listWebhookEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('eventType') eventType?: string,
  ): Promise<{
    events: WebhookEvent[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.webhookService.listWebhookEvents(page, limit, eventType);
  }

  @Get('webhooks/events/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Get webhook event',
    description: 'Get webhook event details by ID. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook event retrieved successfully',
    type: WebhookEvent,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook event not found',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Webhook event ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  async getWebhookEvent(
    @Param('eventId') eventId: string,
  ): Promise<WebhookEvent> {
    return this.webhookService.getWebhookEvent(eventId);
  }

  @Post('webhooks/events/:eventId/retry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Retry webhook event',
    description: 'Retry processing a failed webhook event. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook event retry initiated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - maximum retry attempts exceeded',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook event not found',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Webhook event ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  async retryWebhookEvent(
    @Param('eventId') eventId: string,
  ): Promise<void> {
    return this.webhookService.retryWebhookEvent(eventId);
  }

  // Admin-only endpoints for withdrawal management

  @Get('withdrawals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'List withdrawal requests',
    description: 'List all withdrawal requests. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal requests retrieved successfully',
    type: [WithdrawalRequest],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async listWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    // This would be implemented in the service
    return [];
  }

  @Post('withdrawals/:withdrawalId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Approve withdrawal request',
    description: 'Approve a withdrawal request. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal request approved successfully',
    type: WithdrawalRequest,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Withdrawal request not found',
  })
  @ApiParam({
    name: 'withdrawalId',
    description: 'Withdrawal request ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  async approveWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @CurrentUser('id') adminId: string,
  ): Promise<WithdrawalRequest> {
    return this.paymentsService.updateWithdrawalRequest(
      withdrawalId,
      { status: 'approved' },
      adminId,
    );
  }

  @Post('withdrawals/:withdrawalId/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Process withdrawal request',
    description: 'Mark withdrawal request as processing. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal request marked as processing',
    type: WithdrawalRequest,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Withdrawal request not found',
  })
  @ApiParam({
    name: 'withdrawalId',
    description: 'Withdrawal request ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  async processWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @CurrentUser('id') adminId: string,
  ): Promise<WithdrawalRequest> {
    return this.paymentsService.updateWithdrawalRequest(
      withdrawalId,
      { status: 'processing' },
      adminId,
    );
  }

  @Post('withdrawals/:withdrawalId/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Complete withdrawal request',
    description: 'Mark withdrawal request as completed and process payout. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal request completed successfully',
    type: WithdrawalRequest,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Withdrawal request not found',
  })
  @ApiParam({
    name: 'withdrawalId',
    description: 'Withdrawal request ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  async completeWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @CurrentUser('id') adminId: string,
  ): Promise<WithdrawalRequest> {
    return this.paymentsService.updateWithdrawalRequest(
      withdrawalId,
      { status: 'completed' },
      adminId,
    );
  }
}
