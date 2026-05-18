import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationItem } from './reservation-item.entity';

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
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
    default: ReservationStatus.CONFIRMED,
  })
  status!: ReservationStatus;

  @OneToMany(() => ReservationItem, (item) => item.reservation, {
    cascade: ['insert'],
  })
  items!: ReservationItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
