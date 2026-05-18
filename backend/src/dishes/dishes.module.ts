import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish, User]),
    AuthModule,
  ],
  controllers: [DishesController],
  providers: [DishesService],
})
export class DishesModule {}
