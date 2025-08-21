import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { UserProfile } from '../common/interfaces/user-profile.interface';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.verifyPassword(user, loginDto.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const sessionId = this.generateSessionId();

    // Set secure HTTP-only cookie
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    // Update last login
    await this.updateLastLogin(user.id);

    // Create user profile
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phone,
      status: user.isActive ? 'active' : 'inactive',
      roles: [user.role],
      permissions: this.getPermissionsForRole(user.role),
      lastLoginAt: new Date().toISOString(),
      createdAt: user.createdAt.toISOString(),
    };

    return ApiResponseHelper.success(
      {
        user: userProfile,
        sessionId,
      },
      'Login successful',
      '000',
    );
  }

  async logout(response: Response) {
    // Clear the cookie
    response.clearCookie('accessToken', { path: '/' });
    
    return ApiResponseHelper.success(
      null,
      'Logout successful',
      '000',
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    // This would typically update a lastLoginAt field in the user entity
    // For now, we'll just log it
    console.log(`User ${userId} logged in at ${new Date().toISOString()}`);
  }

  private getPermissionsForRole(role: string): string[] {
    const permissions = {
      client: ['read:own_profile', 'update:own_profile', 'create:bookings', 'read:own_bookings'],
      professional: ['read:own_profile', 'update:own_profile', 'read:bookings', 'update:bookings', 'read:earnings'],
    };
    
    return permissions[role] || [];
  }
}
