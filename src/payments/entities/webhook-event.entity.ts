import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum WebhookEventStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('webhook_events')
@Index(['stripeEventId'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stripe_event_id', type: 'varchar', length: 255, unique: true, nullable: false })
  stripeEventId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100, nullable: false })
  eventType: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: WebhookEventStatus,
    default: WebhookEventStatus.PROCESSING,
  })
  status: WebhookEventStatus;

  @Column({ type: 'jsonb', nullable: false })
  payload: Record<string, any>;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Helper methods
  markAsCompleted(): void {
    this.status = WebhookEventStatus.COMPLETED;
    this.processedAt = new Date();
  }

  markAsFailed(error: string): void {
    this.status = WebhookEventStatus.FAILED;
    this.errorMessage = error;
    this.retryCount += 1;
  }

  canRetry(): boolean {
    return this.status === WebhookEventStatus.FAILED && this.retryCount < 3;
  }

  resetForRetry(): void {
    this.status = WebhookEventStatus.PROCESSING;
    this.errorMessage = null;
  }
}
