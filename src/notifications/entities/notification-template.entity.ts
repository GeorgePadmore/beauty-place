import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType, NotificationCategory } from './notification.entity';

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('notification_templates')
@Index(['type', 'category', 'status'])
@Index(['name', 'status'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: NotificationType, nullable: false })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationCategory, nullable: false })
  category: NotificationCategory;

  @Column({ type: 'enum', enum: TemplateStatus, default: TemplateStatus.ACTIVE })
  status: TemplateStatus;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subject: string; // For emails

  @Column({ type: 'text', nullable: false })
  content: string; // HTML content for emails, plain text for SMS

  @Column({ type: 'text', nullable: true })
  plainTextContent: string; // Plain text version for emails

  @Column({ type: 'jsonb', nullable: true })
  variables: string[]; // Array of variable names that can be replaced

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language: string; // ISO language code

  @Column({ type: 'varchar', length: 100, nullable: true })
  version: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    return this.status === TemplateStatus.ACTIVE && !this.isDeleted;
  }

  isEmail(): boolean {
    return this.type === NotificationType.EMAIL;
  }

  isSms(): boolean {
    return this.type === NotificationType.SMS;
  }

  isPush(): boolean {
    return this.type === NotificationType.PUSH;
  }

  getVariables(): string[] {
    return this.variables || [];
  }

  hasVariable(variableName: string): boolean {
    return this.getVariables().includes(variableName);
  }

  replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }
}
