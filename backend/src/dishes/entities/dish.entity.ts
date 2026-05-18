import { ReservationItem } from '../../reservations/entities/reservation-item.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
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

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  restaurant_id!: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.dishes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'boolean', default: true })
  is_available!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @OneToMany(() => ReservationItem, (reservationItem) => reservationItem.dish)
  reservation_items!: ReservationItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}