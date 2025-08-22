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
import { ProfessionalsService } from '../services/professionals.service';
import { CreateProfessionalDto } from '../dto/create-professional.dto';
import { UpdateProfessionalDto } from '../dto/update-professional.dto';
import { ProfessionalResponseDto } from '../dto/professional-response.dto';
import { ProfessionalStatus, VerificationStatus } from '../entities/professional.entity';
import { UserRole } from '../../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseHelper, ApiResponse as ApiResponseType } from '../../common/helpers/api-response.helper';

@ApiTags('Professionals')
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @Post()
  @ApiOperation({
    summary: 'Create a new professional profile',
    description: 'Creates a new professional profile for a user with professional role',
  })
  @ApiBody({ type: CreateProfessionalDto })
  @ApiResponse({
    status: 201,
    description: 'Professional profile created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user must have professional role',
  })
  @ApiResponse({
    status: 409,
    description: 'Professional profile already exists for this user',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Professional role required.',
  })
  @ApiBearerAuth()
  async create(@Body() createProfessionalDto: CreateProfessionalDto): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.create(createProfessionalDto);
    return ApiResponseHelper.success(professional, 'Professional profile created successfully', '000');
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all professionals',
    description: 'Retrieves a list of all active professionals with optional filtering',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProfessionalStatus,
    description: 'Filter by professional status',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by service category',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by service area location',
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
    description: 'List of professionals retrieved successfully',
  })
  async findAll(
    @Query('status') status?: ProfessionalStatus,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponseType<ProfessionalResponseDto[]>> {
    const professionals = await this.professionalsService.findAll(
      status,
      category,
      location,
      limit,
      offset,
    );
    return ApiResponseHelper.success(professionals, 'Professionals retrieved successfully', '000');
  }

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search professionals',
    description: 'Search for professionals with advanced filtering options',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by service area location',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by service category',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Minimum average rating (1-5)',
  })
  @ApiQuery({
    name: 'maxTravelDistance',
    required: false,
    type: Number,
    description: 'Maximum travel distance in kilometers',
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
  async searchProfessionals(
    @Query('location') location?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: number,
    @Query('maxTravelDistance') maxTravelDistance?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponseType<ProfessionalResponseDto[]>> {
    const professionals = await this.professionalsService.searchProfessionals(
      location,
      category,
      minRating,
      maxTravelDistance,
      limit,
      offset,
    );
    return ApiResponseHelper.success(professionals, 'Search results retrieved successfully', '000');
  }

  @Public()
  @Get('featured')
  @ApiOperation({
    summary: 'Get featured professionals',
    description: 'Retrieves a list of featured professionals',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured professionals retrieved successfully',
  })
  async getFeaturedProfessionals(@Query('limit') limit?: number): Promise<ApiResponseType<ProfessionalResponseDto[]>> {
    const professionals = await this.professionalsService.getFeaturedProfessionals(limit);
    return ApiResponseHelper.success(professionals, 'Featured professionals retrieved successfully', '000');
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get professional by ID',
    description: 'Retrieves a specific professional by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  async findOne(@Param('id') id: string): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.findOne(id);
    return ApiResponseHelper.success(professional, 'Professional retrieved successfully', '000');
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get professional by user ID',
    description: 'Retrieves a professional profile by user ID',
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional profile not found for this user',
  })
  async findByUserId(@Param('userId') userId: string): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.findByUserId(userId);
    return ApiResponseHelper.success(professional, 'Professional profile retrieved successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update professional profile',
    description: 'Updates an existing professional profile with the provided information',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateProfessionalDto })
  @ApiResponse({
    status: 200,
    description: 'Professional profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: UpdateProfessionalDto,
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.update(id, updateProfessionalDto);
    return ApiResponseHelper.success(professional, 'Professional profile updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete professional profile',
    description: 'Soft deletes a professional profile (marks as deleted but keeps data)',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async remove(@Param('id') id: string): Promise<ApiResponseType<null>> {
    await this.professionalsService.remove(id);
    return ApiResponseHelper.success(null, 'Professional profile deleted successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update professional status',
    description: 'Updates the status of a professional profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ProfessionalStatus),
          description: 'New professional status',
        },
        notes: {
          type: 'string',
          description: 'Optional notes about the status change',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Professional status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ProfessionalStatus; notes?: string },
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.updateStatus(id, body.status, body.notes);
    return ApiResponseHelper.success(professional, 'Professional status updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/verification')
  @ApiOperation({
    summary: 'Update verification status',
    description: 'Updates the verification status of a professional profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verificationStatus: {
          type: 'string',
          enum: Object.values(VerificationStatus),
          description: 'New verification status',
        },
        notes: {
          type: 'string',
          description: 'Optional notes about the verification',
        },
      },
      required: ['verificationStatus'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async updateVerificationStatus(
    @Param('id') id: string,
    @Body() body: { verificationStatus: VerificationStatus; notes?: string },
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.updateVerificationStatus(
      id,
      body.verificationStatus,
      body.notes,
    );
    return ApiResponseHelper.success(professional, 'Verification status updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/featured')
  @ApiOperation({
    summary: 'Toggle featured status',
    description: 'Toggles the featured status of a professional profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isFeatured: {
          type: 'boolean',
          description: 'Whether the professional should be featured',
        },
        featuredUntil: {
          type: 'string',
          format: 'date-time',
          description: 'Optional date until which the professional should be featured',
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
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async toggleFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean; featuredUntil?: string },
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const featuredUntil = body.featuredUntil ? new Date(body.featuredUntil) : undefined;
    const professional = await this.professionalsService.toggleFeatured(id, body.isFeatured, featuredUntil);
    return ApiResponseHelper.success(professional, 'Featured status updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/premium')
  @ApiOperation({
    summary: 'Toggle premium status',
    description: 'Toggles the premium status of a professional profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPremium: {
          type: 'boolean',
          description: 'Whether the professional should be premium',
        },
        premiumUntil: {
          type: 'string',
          format: 'date-time',
          description: 'Optional date until which the professional should be premium',
        },
      },
      required: ['isPremium'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Premium status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async togglePremium(
    @Param('id') id: string,
    @Body() body: { isPremium: boolean; premiumUntil?: string },
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const premiumUntil = body.premiumUntil ? new Date(body.premiumUntil) : undefined;
    const professional = await this.professionalsService.togglePremium(id, body.isPremium, premiumUntil);
    return ApiResponseHelper.success(professional, 'Premium status updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/rating')
  @ApiOperation({
    summary: 'Update professional rating',
    description: 'Updates the rating of a professional profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
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
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async updateRating(
    @Param('id') id: string,
    @Body() body: { rating: number },
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.updateRating(id, body.rating);
    return ApiResponseHelper.success(professional, 'Rating updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/completion-rate')
  @ApiOperation({
    summary: 'Update completion rate',
    description: 'Updates the completion rate of a professional profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional unique identifier',
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
    description: 'Professional not found',
  })
  @ApiBearerAuth()
  async updateCompletionRate(
    @Param('id') id: string,
    @Body() body: { completed: boolean },
  ): Promise<ApiResponseType<ProfessionalResponseDto>> {
    const professional = await this.professionalsService.updateCompletionRate(id, body.completed);
    return ApiResponseHelper.success(professional, 'Completion rate updated successfully', '000');
  }
}
