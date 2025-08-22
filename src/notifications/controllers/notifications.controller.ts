import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { NotificationStatus, NotificationType, NotificationCategory } from '../entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: NotificationStatus,
  ) {
    return await this.notificationsService.getUserNotifications(req.user.id, page, limit, status);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getUserPreferences(@Request() req) {
    return await this.notificationsService.getUserPreferences(req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updateUserPreferences(
    @Request() req,
    @Body() preferences: Array<{
      type: NotificationType;
      category: NotificationCategory;
      enabled: boolean;
      recipient?: string;
      schedule?: any;
    }>,
  ) {
    return await this.notificationsService.updateUserPreferences(req.user.id, preferences);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return await this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('test/email')
  @ApiOperation({ summary: 'Send test email notification' })
  @ApiResponse({ status: 201, description: 'Test email sent successfully' })
  @Roles(UserRole.ADMINISTRATOR)
  async sendTestEmail(@Request() req, @Body() data: { recipient: string; message: string }) {
    return await this.notificationsService.createAndSend({
      userId: req.user.id,
      type: NotificationType.EMAIL,
      category: NotificationCategory.SYSTEM,
      title: 'Test Email',
      message: data.message,
      recipient: data.recipient,
    });
  }

  @Post('test/sms')
  @ApiOperation({ summary: 'Send test SMS notification' })
  @ApiResponse({ status: 201, description: 'Test SMS sent successfully' })
  @Roles(UserRole.ADMINISTRATOR)
  async sendTestSms(@Request() req, @Body() data: { recipient: string; message: string }) {
    return await this.notificationsService.createAndSend({
      userId: req.user.id,
      type: NotificationType.SMS,
      category: NotificationCategory.SYSTEM,
      title: 'Test SMS',
      message: data.message,
      recipient: data.recipient,
    });
  }
}
