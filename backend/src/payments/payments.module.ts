import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([Payment,Reservation,User]) ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
