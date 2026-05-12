import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Dish } from '../dishes/entities/dish.entity';
import { User } from '../users/entities/user.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationItem } from './entities/reservation-item.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationItem, Dish, User]),
    AuthModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
