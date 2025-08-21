import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AvailabilityService } from '../services/availability.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dto';
import { AvailabilityStatus } from '../entities/availability.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new availability slot' })
  @ApiResponse({ status: 201, description: 'Availability created successfully' })
  async create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @CurrentUser() user: any
  ) {
    const availability = await this.availabilityService.create(
      createAvailabilityDto,
      user.id
    );
    return ApiResponseHelper.success(
      availability,
      'Availability created successfully',
      '000'
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all availability slots' })
  @ApiResponse({ status: 200, description: 'Availabilities retrieved successfully' })
  async findAll() {
    const availabilities = await this.availabilityService.findAll();
    return ApiResponseHelper.success(
      availabilities,
      'Availabilities retrieved successfully',
      '000'
    );
  }

  @Get('professional/:professionalId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get availability slots for a specific professional' })
  @ApiResponse({ status: 200, description: 'Professional availabilities retrieved successfully' })
  async findByProfessional(@Param('professionalId') professionalId: string) {
    const availabilities = await this.availabilityService.findByProfessional(professionalId);
    return ApiResponseHelper.success(
      availabilities,
      'Professional availabilities retrieved successfully',
      '000'
    );
  }

  @Get('professional/:professionalId/weekly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly schedule for a professional' })
  @ApiResponse({ status: 200, description: 'Weekly schedule retrieved successfully' })
  async getWeeklySchedule(@Param('professionalId') professionalId: string) {
    const schedule = await this.availabilityService.getWeeklySchedule(professionalId);
    return ApiResponseHelper.success(
      schedule,
      'Weekly schedule retrieved successfully',
      '000'
    );
  }

  @Get('professional/:professionalId/available-slots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find available slots for a professional on a specific date' })
  @ApiQuery({ name: 'date', description: 'Date to check (YYYY-MM-DD)', example: '2024-01-15' })
  @ApiQuery({ name: 'serviceDuration', description: 'Service duration in minutes', example: '60' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  async findAvailableSlots(
    @Param('professionalId') professionalId: string,
    @Query('date') date: string,
    @Query('serviceDuration') serviceDuration: string
  ) {
    const targetDate = new Date(date);
    const durationMinutes = parseInt(serviceDuration, 10);
    
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return ApiResponseHelper.error(
        'Invalid service duration',
        '400'
      );
    }

    const slots = await this.availabilityService.findAvailableSlots(
      professionalId,
      targetDate,
      durationMinutes
    );
    
    return ApiResponseHelper.success(
      slots,
      'Available slots retrieved successfully',
      '000'
    );
  }

  @Get('professional/:professionalId/date-range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get availability for a professional within a date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Date range availabilities retrieved successfully' })
  async findByDateRange(
    @Param('professionalId') professionalId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return ApiResponseHelper.error(
        'Invalid date format',
        '400'
      );
    }

    const availabilities = await this.availabilityService.findByDateRange(
      professionalId,
      start,
      end
    );
    
    return ApiResponseHelper.success(
      availabilities,
      'Date range availabilities retrieved successfully',
      '000'
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific availability slot' })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully' })
  async findOne(@Param('id') id: string) {
    const availability = await this.availabilityService.findOne(id);
    return ApiResponseHelper.success(
      availability,
      'Availability retrieved successfully',
      '000'
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an availability slot' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto
  ) {
    const availability = await this.availabilityService.update(id, updateAvailabilityDto);
    return ApiResponseHelper.success(
      availability,
      'Availability updated successfully',
      '000'
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability status' })
  @ApiResponse({ status: 200, description: 'Availability status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: AvailabilityStatus
  ) {
    const availability = await this.availabilityService.updateStatus(id, status);
    return ApiResponseHelper.success(
      availability,
      'Availability status updated successfully',
      '000'
    );
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle availability active status' })
  @ApiResponse({ status: 200, description: 'Availability active status toggled successfully' })
  async toggleActive(@Param('id') id: string) {
    const availability = await this.availabilityService.toggleActive(id);
    return ApiResponseHelper.success(
      availability,
      'Availability active status toggled successfully',
      '000'
    );
  }

  @Patch(':id/current-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current bookings count' })
  @ApiResponse({ status: 200, description: 'Current bookings updated successfully' })
  async updateCurrentBookings(
    @Param('id') id: string,
    @Body('change') change: number
  ) {
    const availability = await this.availabilityService.updateCurrentBookings(id, change);
    return ApiResponseHelper.success(
      availability,
      'Current bookings updated successfully',
      '000'
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an availability slot' })
  @ApiResponse({ status: 200, description: 'Availability deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.availabilityService.remove(id);
    return ApiResponseHelper.success(
      null,
      'Availability deleted successfully',
      '000'
    );
  }
}
