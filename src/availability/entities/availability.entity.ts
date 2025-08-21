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

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  BREAK = 'break',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

@Entity('availability')
@Index(['professionalId', 'dayOfWeek'])
@Index(['professionalId', 'date'])
@Index(['status', 'isActive'])
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'professional_id', type: 'uuid' })
  professionalId: string;

  @Column({ name: 'day_of_week', type: 'integer', nullable: false })
  dayOfWeek: DayOfWeek; // 0=Sunday, 1=Monday, 2=Tuesday, etc.

  @Column({ name: 'date', type: 'date', nullable: true })
  date: Date; // For specific date overrides

  @Column({ name: 'start_time', type: 'time', nullable: false })
  startTime: string; // Format: "HH:MM"

  @Column({ name: 'end_time', type: 'time', nullable: false })
  endTime: string; // Format: "HH:MM"

  @Column({ name: 'status', type: 'enum', enum: AvailabilityStatus, default: AvailabilityStatus.AVAILABLE })
  status: AvailabilityStatus;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_recurring', type: 'boolean', default: true })
  isRecurring: boolean; // Weekly recurring vs specific date

  @Column({ name: 'break_start_time', type: 'time', nullable: true })
  breakStartTime: string; // Break time within the slot

  @Column({ name: 'break_end_time', type: 'time', nullable: true })
  breakEndTime: string; // Break time within the slot

  @Column({ name: 'max_bookings', type: 'integer', nullable: true })
  maxBookings: number; // Maximum bookings allowed in this slot

  @Column({ name: 'current_bookings', type: 'integer', default: 0 })
  currentBookings: number; // Current number of bookings

  @Column({ name: 'advance_booking_hours', type: 'integer', default: 24 })
  advanceBookingHours: number; // How many hours in advance bookings can be made

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string; // Additional notes about this availability

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

  get breakDurationMinutes(): number {
    if (!this.breakStartTime || !this.breakEndTime) return 0;
    const start = this.parseTime(this.breakStartTime);
    const end = this.parseTime(this.breakEndTime);
    return end - start;
  }

  get availableDurationMinutes(): number {
    return this.durationMinutes - this.breakDurationMinutes;
  }

  isTimeInRange(time: string): boolean {
    const checkTime = this.parseTime(time);
    const start = this.parseTime(this.startTime);
    const end = this.parseTime(this.endTime);
    return checkTime >= start && checkTime <= end;
  }

  isBreakTime(time: string): boolean {
    if (!this.breakStartTime || !this.breakEndTime) return false;
    const checkTime = this.parseTime(time);
    const start = this.parseTime(this.breakStartTime);
    const end = this.parseTime(this.breakEndTime);
    return checkTime >= start && checkTime <= end;
  }

  canAcceptBooking(): boolean {
    return this.isAvailable && 
           this.status === AvailabilityStatus.AVAILABLE && 
           this.isActive && 
           !this.isDeleted &&
           (this.maxBookings === null || this.currentBookings < this.maxBookings);
  }

  isAdvanceBookingAllowed(hoursInAdvance: number): boolean {
    return hoursInAdvance >= this.advanceBookingHours;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
