import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiResponseHelper, ApiResponse as ApiResponseType } from '../common/helpers/api-response.helper';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponseType<UserResponseDto>> {
    const user = await this.usersService.create(createUserDto);
    return ApiResponseHelper.success(user, 'User created successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all active users',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter users by role',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @ApiBearerAuth()
  async findAll(@Query('role') role?: UserRole): Promise<ApiResponseType<UserResponseDto[]>> {
    let users;
    if (role) {
      users = await this.usersService.findByRole(role);
    } else {
      users = await this.usersService.findAll();
    }
    return ApiResponseHelper.success(users, 'Users retrieved successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their unique identifier (users can only view their own profile)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') requestingUserId: string,
  ): Promise<ApiResponseType<UserResponseDto>> {
    const user = await this.usersService.findOne(id, requestingUserId);
    return ApiResponseHelper.success(user, 'User retrieved successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user with the provided information (users can only update their own profile)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') requestingUserId: string,
  ): Promise<ApiResponseType<UserResponseDto>> {
    const user = await this.usersService.update(id, updateUserDto, requestingUserId);
    return ApiResponseHelper.success(user, 'User updated successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft deletes a user (marks as deleted but keeps data) (users can only delete their own profile)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') requestingUserId: string,
  ): Promise<ApiResponseType<null>> {
    await this.usersService.remove(id, requestingUserId);
    return ApiResponseHelper.success(null, 'User deleted successfully', '000');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-active')
  @ApiOperation({
    summary: 'Toggle user active status',
    description: 'Activates or deactivates a user account (users can only toggle their own status)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User active status toggled successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only toggle your own profile status',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  async toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') requestingUserId: string,
  ): Promise<ApiResponseType<UserResponseDto>> {
    const user = await this.usersService.toggleActive(id, requestingUserId);
    return ApiResponseHelper.success(user, 'User active status toggled successfully', '000');
  }
}
