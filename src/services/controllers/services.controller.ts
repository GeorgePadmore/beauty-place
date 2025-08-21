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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { ServiceResponseDto } from '../dto/service-response.dto';
import { ServiceStatus } from '../entities/service.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiResponseHelper, ApiResponse as ApiResponseType } from '../../common/helpers/api-response.helper';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a new service',
    description: 'Creates a new service for a professional',
  })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Service with this name already exists for this professional',
  })
  @ApiBearerAuth()
  async create(@Body() createServiceDto: CreateServiceDto): Promise<ApiResponseType<ServiceResponseDto>> {
    const service = await this.servicesService.create(createServiceDto);
    return ApiResponseHelper.success(service, 'Service created successfully', '000');
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all services',
    description: 'Retrieves a list of all services with optional filtering',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    description: 'Filter by professional ID',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by service category',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ServiceStatus,
    description: 'Filter by service status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (default: 20)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of results to skip (default: 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of services retrieved successfully',
  })
  async findAll(
    @Query('professionalId') professionalId?: string,
    @Query('category') category?: string,
    @Query('status') status?: ServiceStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponseType<ServiceResponseDto[]>> {
    const services = await this.servicesService.findAll(
      professionalId,
      category,
      status,
      limit,
      offset,
    );
    return ApiResponseHelper.success(services, 'Services retrieved successfully', '000');
  }

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search services',
    description: 'Search for services with advanced filtering options',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by service category',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'maxDuration',
    required: false,
    type: Number,
    description: 'Maximum duration in minutes',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (default: 20)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of results to skip (default: 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchServices(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('maxDuration') maxDuration?: number,
    @Query('location') location?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponseType<ServiceResponseDto[]>> {
    const services = await this.servicesService.searchServices(
      category,
      minPrice,
      maxPrice,
      maxDuration,
      location,
      limit,
      offset,
    );
    return ApiResponseHelper.success(services, 'Search results retrieved successfully', '000');
  }

  @Public()
  @Get('featured')
  @ApiOperation({
    summary: 'Get featured services',
    description: 'Retrieves a list of featured services',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured services retrieved successfully',
  })
  async getFeaturedServices(@Query('limit') limit?: number): Promise<ApiResponseType<ServiceResponseDto[]>> {
    const services = await this.servicesService.getFeaturedServices(limit);
    return ApiResponseHelper.success(services, 'Featured services retrieved successfully', '000');
  }

  @Public()
  @Get('professional/:professionalId')
  @ApiOperation({
    summary: 'Get services by professional ID',
    description: 'Retrieves all services for a specific professional',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional services retrieved successfully',
  })
  async findByProfessionalId(@Param('professionalId') professionalId: string): Promise<ApiResponseType<ServiceResponseDto[]>> {
    const services = await this.servicesService.findByProfessionalId(professionalId);
    return ApiResponseHelper.success(services, 'Professional services retrieved successfully', '000');
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get service by ID',
    description: 'Retrieves a specific service by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Service retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async findOne(@Param('id') id: string): Promise<ApiResponseType<ServiceResponseDto>> {
    const service = await this.servicesService.findOne(id);
    return ApiResponseHelper.success(service, 'Service retrieved successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update service',
    description: 'Updates an existing service with the provided information',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Service name conflict',
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ApiResponseType<ServiceResponseDto>> {
    const service = await this.servicesService.update(id, updateServiceDto);
    return ApiResponseHelper.success(service, 'Service updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete service',
    description: 'Soft deletes a service (marks as deleted but keeps data)',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  async remove(@Param('id') id: string): Promise<ApiResponseType<null>> {
    await this.servicesService.remove(id);
    return ApiResponseHelper.success(null, 'Service deleted successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update service status',
    description: 'Updates the status of a service',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ServiceStatus),
          description: 'New service status',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ServiceStatus },
  ): Promise<ApiResponseType<ServiceResponseDto>> {
    const service = await this.servicesService.updateStatus(id, body.status);
    return ApiResponseHelper.success(service, 'Service status updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/featured')
  @ApiOperation({
    summary: 'Toggle featured status',
    description: 'Toggles the featured status of a service',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isFeatured: {
          type: 'boolean',
          description: 'Whether the service should be featured',
        },
        featuredUntil: {
          type: 'string',
          format: 'date-time',
          description: 'Optional date until which the service should be featured',
        },
      },
      required: ['isFeatured'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Featured status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  async toggleFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean; featuredUntil?: string },
  ): Promise<ApiResponseType<ServiceResponseDto>> {
    const featuredUntil = body.featuredUntil ? new Date(body.featuredUntil) : undefined;
    const service = await this.servicesService.toggleFeatured(id, body.isFeatured, featuredUntil);
    return ApiResponseHelper.success(service, 'Featured status updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/rating')
  @ApiOperation({
    summary: 'Update service rating',
    description: 'Updates the rating of a service',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'New rating value (1-5)',
        },
      },
      required: ['rating'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rating updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid rating value',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  async updateRating(
    @Param('id') id: string,
    @Body() body: { rating: number },
  ): Promise<ApiResponseType<ServiceResponseDto>> {
    const service = await this.servicesService.updateRating(id, body.rating);
    return ApiResponseHelper.success(service, 'Rating updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/completion-rate')
  @ApiOperation({
    summary: 'Update completion rate',
    description: 'Updates the completion rate of a service',
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        completed: {
          type: 'boolean',
          description: 'Whether the service was completed successfully',
        },
      },
      required: ['completed'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Completion rate updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  async updateCompletionRate(
    @Param('id') id: string,
    @Body() body: { completed: boolean },
  ): Promise<ApiResponseType<ServiceResponseDto>> {
    const service = await this.servicesService.updateCompletionRate(id, body.completed);
    return ApiResponseHelper.success(service, 'Completion rate updated successfully', '000');
  }
}
