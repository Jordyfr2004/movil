import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 🔥 a qué restaurante pertenece
  @Column({ type: 'uuid' })
  restaurant_id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // 🔥 precio correcto (decimal)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  // 🔥 disponible hoy o no
  @Column({ type: 'boolean', default: true })
  is_available!: boolean;

  // 🔥 activo en el sistema
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}