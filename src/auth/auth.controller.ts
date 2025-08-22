import { Controller, Post, Body, Res, UseGuards, Get } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiResponse as ApiResponseType } from '../common/helpers/api-response.helper';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return session information',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        responseMessage: { type: 'string', example: 'Login successful' },
        responseData: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                email: { type: 'string', example: 'john.doe@example.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                fullName: { type: 'string', example: 'John Doe' },
                phoneNumber: { type: 'string', example: '+1234567890' },
                status: { type: 'string', example: 'active' },
                roles: { type: 'array', items: { type: 'string' }, example: ['client'] },
                permissions: { type: 'array', items: { type: 'string' } },
                lastLoginAt: { type: 'string', example: '2024-01-15T10:30:00Z' },
                createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' },
              },
            },
            sessionId: { type: 'string', example: 'session_1234567890_abc123' },
          },
        },
        responseCode: { type: 'string', example: '000' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponseType<any>> {
    return this.authService.login(loginDto, response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and clear session',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponseType<any>> {
    return this.authService.logout(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get current user profile information',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser() user: any) {
    // This would return the current user's profile
    // For now, just return success
    return {
      success: true,
      responseMessage: 'Profile retrieved successfully',
      responseData: { userId: user.userId, email: user.email, role: user.role },
      responseCode: '000',
      timestamp: new Date().toISOString(),
    };
  }
}
