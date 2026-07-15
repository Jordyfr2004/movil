import { AuthAccount } from '../../auth/entities/auth-account.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Payment } from '../../payments/entities/payment.entity';
import {Column,CreateDateColumn,Entity,JoinColumn,ManyToOne,OneToMany,PrimaryGeneratedColumn,UpdateDateColumn} from 'typeorm';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  STUDENT = 'STUDENT',
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255 })
  full_name!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({type: 'integer',default: 0,})
  session_version!: number;
  

  @Column({ type: 'uuid', nullable: true })
  restaurant_id!: string | null;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant | null;

  @OneToMany(() => AuthAccount, (authAccount) => authAccount.user)
  auth_accounts!: AuthAccount[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_tokens!: RefreshToken[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
