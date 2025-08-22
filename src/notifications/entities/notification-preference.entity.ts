import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType, NotificationCategory } from './notification.entity';

@Entity('notification_preferences')
@Index(['userId', 'category'])
@Index(['userId', 'type'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType, nullable: false })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationCategory, nullable: false })
  category: NotificationCategory;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipient: string; // Email, phone number, or device token

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    quietHours?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
      timezone: string;
    };
    frequency?: 'immediate' | 'daily' | 'weekly';
    preferredTime?: string; // HH:MM format
  };

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isEnabled(): boolean {
    return this.enabled && !this.isDeleted;
  }

  isInQuietHours(date: Date = new Date()): boolean {
    if (!this.schedule?.quietHours) return false;
    
    const { start, end, timezone } = this.schedule.quietHours;
    const userTime = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const currentTime = userTime.toTimeString().slice(0, 5);
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Handles overnight quiet hours (e.g., 22:00 to 06:00)
      return currentTime >= start || currentTime <= end;
    }
  }

  canSendNow(): boolean {
    return this.isEnabled() && !this.isInQuietHours();
  }
}
