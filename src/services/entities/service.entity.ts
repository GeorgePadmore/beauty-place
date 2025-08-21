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
import { ServiceCategory } from '../../common/enums/service-category.enum';

@Entity('services')
@Index(['professionalId', 'category'])
@Index(['priceCents'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'professional_id', type: 'uuid' })
  professionalId: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_minutes', type: 'integer', nullable: false })
  durationMinutes: number;

  @Column({ name: 'price_cents', type: 'integer', nullable: false })
  priceCents: number;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
    nullable: false,
  })
  category: ServiceCategory;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Professional, (professional) => professional.services)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  // Helper methods
  get price(): number {
    return this.priceCents / 100;
  }

  setPrice(price: number): void {
    this.priceCents = Math.round(price * 100);
  }

  get durationHours(): number {
    return this.durationMinutes / 60;
  }

  get hourlyRate(): number {
    return (this.priceCents / this.durationMinutes) * 60;
  }
}
