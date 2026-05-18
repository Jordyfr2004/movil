import { Dish } from '../../dishes/entities/dish.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('reservation_items')
export class ReservationItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  reservation_id!: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation;

  @Column({ type: 'uuid' })
  dish_id!: string;

  @ManyToOne(() => Dish, (dish) => dish.reservation_items, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'dish_id' })
  dish!: Dish;

  @Column({ type: 'varchar', length: 255 })
  dish_name!: string;

  @Column({ type: 'text', nullable: true })
  dish_description!: string | null;

  @Column({ type: 'uuid' })
  restaurant_id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price!: string;
}
