import { User } from '../../users/entities/user.entity';
import {Column,CreateDateColumn,Entity,JoinColumn,ManyToOne,OneToMany,PrimaryGeneratedColumn,UpdateDateColumn,} from 'typeorm';
import { ReservationItem } from './reservation-item.entity';
import { Payment } from '../../payments/entities/payment.entity'

export enum ReservationStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}

export enum ReservationDeliveryStatus {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PENDING_DELIVERY = 'PENDING_DELIVERY',
  DELIVERED = 'DELIVERED',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, (user) => user.reservations, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING_PAYMENT,
  })
  status!: ReservationStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total_amount!: string;

  @Column({ type: 'uuid'})
  restaurant_id!: string;

  @OneToMany(() => ReservationItem, (item) => item.reservation, {
    cascade: ['insert'],
  })
  items!: ReservationItem[];

  @OneToMany(() => Payment, (payment) => payment.reservation)
  payments!: Payment[];

  @Column({ type: 'date'})
  reservation_date!: string;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  confirmed_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  delivered_by!: string | null;

  @Column({type: 'varchar',length: 64,nullable: true,unique: true,})
  pickup_token_hash!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  pickup_token_expires_at!: Date | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'delivered_by' })
  delivered_by_user!: User | null;


  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
