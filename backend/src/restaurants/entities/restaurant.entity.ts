import { Dish } from '../../dishes/entities/dish.entity';
import { User } from '../../users/entities/user.entity';
import {Column,CreateDateColumn,Entity,OneToMany,PrimaryGeneratedColumn,UpdateDateColumn} from 'typeorm';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({type: 'text',nullable: true,})
  image_url!: string | null;

  @Column({type: 'text',nullable: true,})
  image_path!: string | null;

  @OneToMany(() => Dish, (dish) => dish.restaurant)
  dishes!: Dish[];

  @OneToMany(() => User, (user) => user.restaurant)
  users!: User[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
