import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Min, Max } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto, UpdateBookingDto, BookingResponseDto } from '../dto';
import { BookingStatus, PaymentStatus } from '../entities/booking.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';

type ApiResponseType<T> = {
  success: boolean;
  responseMessage: string;
  responseData?: T;
  responseCode: string;
  timestamp: string;
};

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or business rules violated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - double booking or unavailable time slot' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser('id') clientId: string
  ): Promise<ApiResponseType<BookingResponseDto>> {
    try {
      const booking = await this.bookingsService.create(createBookingDto, clientId);
      return ApiResponseHelper.success(
        booking,
        'Booking created successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to create booking',
        '001'
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<ApiResponseType<BookingResponseDto[]>> {
    try {
      const bookings = await this.bookingsService.findAll();
      return ApiResponseHelper.success(
        bookings,
        'Bookings retrieved successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to retrieve bookings',
        '001'
      );
    }
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user\'s bookings' })
  @ApiResponse({ status: 200, description: 'List of user\'s bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyBookings(
    @CurrentUser('id') userId: string
  ): Promise<ApiResponseType<BookingResponseDto[]>> {
    try {
      const bookings = await this.bookingsService.findByClient(userId);
      return ApiResponseHelper.success(
        bookings,
        'Your bookings retrieved successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to retrieve your bookings',
        '001'
      );
    }
  }

  @Get('professional/:professionalId')
  @ApiOperation({ summary: 'Get bookings for a specific professional' })
  @ApiParam({ name: 'professionalId', description: 'Professional ID' })
  @ApiResponse({ status: 200, description: 'List of professional\'s bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Professional not found' })
  async findByProfessional(
    @Param('professionalId', ParseUUIDPipe) professionalId: string
  ): Promise<ApiResponseType<BookingResponseDto[]>> {
    try {
      const bookings = await this.bookingsService.findByProfessional(professionalId);
      return ApiResponseHelper.success(
        bookings,
        'Professional bookings retrieved successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to retrieve professional bookings',
        '001'
      );
    }
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bookings for current user' })
  @ApiQuery({ name: 'isProfessional', required: false, description: 'Whether user is a professional', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of upcoming bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findUpcomingBookings(
    @CurrentUser('id') userId: string,
    @Query('isProfessional') isProfessional: boolean = false
  ): Promise<ApiResponseType<BookingResponseDto[]>> {
    try {
      const bookings = await this.bookingsService.findUpcomingBookings(userId, isProfessional);
      return ApiResponseHelper.success(
        bookings,
        'Upcoming bookings retrieved successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to retrieve upcoming bookings',
        '001'
      );
    }
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s bookings for current user' })
  @ApiQuery({ name: 'isProfessional', required: false, description: 'Whether user is a professional', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of today\'s bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findTodayBookings(
    @CurrentUser('id') userId: string,
    @Query('isProfessional') isProfessional: boolean = false
  ): Promise<ApiResponseType<BookingResponseDto[]>> {
    try {
      const bookings = await this.bookingsService.findTodayBookings(userId, isProfessional);
      return ApiResponseHelper.success(
        bookings,
        'Today\'s bookings retrieved successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to retrieve today\'s bookings',
        '001'
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ApiResponseType<BookingResponseDto>> {
    try {
      const booking = await this.bookingsService.findOne(id);
      return ApiResponseHelper.success(
        booking,
        'Booking retrieved successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to retrieve booking',
        '001'
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser('id') userId: string
  ): Promise<ApiResponseType<BookingResponseDto>> {
    try {
      const booking = await this.bookingsService.update(id, updateBookingDto, userId);
      return ApiResponseHelper.success(
        booking,
        'Booking updated successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to update booking',
        '001'
      );
    }
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiQuery({ name: 'status', enum: BookingStatus, description: 'New booking status' })
  @ApiQuery({ name: 'notes', required: false, description: 'Additional notes' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your booking or invalid action' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status', new ParseEnumPipe(BookingStatus)) status: BookingStatus,
    @Query('notes') notes: string,
    @CurrentUser('id') userId: string
  ): Promise<ApiResponseType<BookingResponseDto>> {
    try {
      const booking = await this.bookingsService.updateStatus(id, status, userId, notes);
      return ApiResponseHelper.success(
        booking,
        'Booking status updated successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to update booking status',
        '001'
      );
    }
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiQuery({ name: 'newStartTime', description: 'New start time (ISO string)' })
  @ApiQuery({ name: 'notes', required: false, description: 'Additional notes' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid time or unavailable' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your booking or cannot reschedule' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('newStartTime') newStartTime: string,
    @Query('notes') notes: string,
    @CurrentUser('id') userId: string
  ): Promise<ApiResponseType<BookingResponseDto>> {
    try {
      const newStartTimeDate = new Date(newStartTime);
      if (isNaN(newStartTimeDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const booking = await this.bookingsService.reschedule(id, newStartTimeDate, userId, notes);
      return ApiResponseHelper.success(
        booking,
        'Booking rescheduled successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to reschedule booking',
        '001'
      );
    }
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Add a review to a completed booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiQuery({ name: 'rating', description: 'Rating (1-5)', type: Number })
  @ApiQuery({ name: 'review', description: 'Review text' })
  @ApiResponse({ status: 200, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid rating or already reviewed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your booking or not completed' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async addReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('rating', ParseIntPipe) rating: number,
    @Query('review') review: string,
    @CurrentUser('id') userId: string
  ): Promise<ApiResponseType<BookingResponseDto>> {
    try {
      const booking = await this.bookingsService.addReview(id, rating, review, userId);
      return ApiResponseHelper.success(
        booking,
        'Review added successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to add review',
        '001'
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking (soft delete)' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string
  ): Promise<ApiResponseType<void>> {
    try {
      await this.bookingsService.remove(id, userId);
      return ApiResponseHelper.success(
        undefined,
        'Booking deleted successfully',
        '000'
      );
    } catch (error) {
      return ApiResponseHelper.error(
        error.message || 'Failed to delete booking',
        '001'
      );
    }
  }
}
