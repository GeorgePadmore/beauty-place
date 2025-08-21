import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { Professional } from '../../professionals/entities/professional.entity';

@Entity('availability')
@Index(['professionalId', 'dayOfWeek'])
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'professional_id', type: 'uuid' })
  professionalId: string;

  @Column({ name: 'day_of_week', type: 'integer', nullable: false })
  dayOfWeek: number; // 0=Sunday, 1=Monday, 2=Tuesday, etc.

  @Column({ name: 'start_time', type: 'time', nullable: false })
  startTime: string; // Format: "HH:MM"

  @Column({ name: 'end_time', type: 'time', nullable: false })
  endTime: string; // Format: "HH:MM"

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Professional, (professional) => professional.availabilities)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  // Helper methods
  get dayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.dayOfWeek] || 'Unknown';
  }

  get durationMinutes(): number {
    const start = this.parseTime(this.startTime);
    const end = this.parseTime(this.endTime);
    return end - start;
  }

  get durationHours(): number {
    return this.durationMinutes / 60;
  }

  isTimeInRange(time: string): boolean {
    const checkTime = this.parseTime(time);
    const start = this.parseTime(this.startTime);
    const end = this.parseTime(this.endTime);
    return checkTime >= start && checkTime <= end;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
