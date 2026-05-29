import { Reservation } from '../../reservations/entities/reservation.entity';
import { User } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, 
PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  reservation_id!: string;

  @ManyToOne(() => Reservation, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_payment_intent_id!: string | null;

  @Column({ type: 'varchar', length: 225, nullable: true})
  stripe_event_id!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true })
  paid_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}