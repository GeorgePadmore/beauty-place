import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Professional } from '../../professionals/entities/professional.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Professional, (professional) => professional.user)
  professional?: Professional;

  @OneToMany(() => Booking, (booking) => booking.client)
  clientBookings?: Booking[];

  @OneToMany(() => Booking, (booking) => booking.professional)
  professionalBookings?: Booking[];

  // Helper methods
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'Unknown User';
  }

  isProfessional(): boolean {
    return this.role === UserRole.PROFESSIONAL;
  }

  isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }
}
