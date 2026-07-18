import {Column,CreateDateColumn,Entity,Index,JoinColumn,ManyToOne,PrimaryGeneratedColumn,} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  RESERVATION_DELIVERED = 'RESERVATION_DELIVERED',
}

@Entity('notifications')
@Index(['user_id', 'is_read'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({
    type: 'varchar',
    length: 150,
  })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  reservation_id!: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_read!: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  read_at!: Date | null;
}