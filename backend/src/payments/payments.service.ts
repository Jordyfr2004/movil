import Stripe from 'stripe';
import {  BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from 'src/reservations/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(
        process.env.STRIPE_SECRET_KEY!,
    );

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,

        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}



    async createPaymentIntent(reservation_id: string, user_id: string,) {
        const reservation = await this.reservationRepo.findOne({
            where: {
                id: reservation_id,
            },
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        if (reservation.user_id !== user_id) {
            throw new BadRequestException('La reserva no pertenece al usuario');
        }

        if (reservation.status !== ReservationStatus.PENDING_PAYMENT) {
            throw new BadRequestException('La reserva no está pendiente de pago');
        }

        if ( reservation.expires_at && reservation.expires_at.getTime() < Date.now()){
            throw new BadRequestException('La reserva ha expirado');
        }
        const amountInCents = Math.round(Number(reservation.total_amount) *100);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: process.env.STRIPE_CURRENCY ??'usd',

            metadata: {
                reservation_id: reservation.id,
                user_id,
            }
        })

        const payment = this.paymentRepo.create({
            user_id,
            reservation_id: reservation.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount: reservation.total_amount,
            currency: process.env.STRIPE_CURRENCY ?? 'usd',
            status: PaymentStatus.PENDING,
        });
        await this.paymentRepo.save(payment,);

        return {
            clientSecret: paymentIntent.client_secret,

            payment_intent_id: paymentIntent.id,
        };
    }
}
