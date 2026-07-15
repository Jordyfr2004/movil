import Stripe from 'stripe';
import {  BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

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

        @InjectRepository(Restaurant)
        private readonly restaurantRepo: Repository<Restaurant>,
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

        const restaurant = await this.restaurantRepo.findOne({
            where: {
                id: reservation.restaurant_id,
                is_active: true,
            },
        });

        if (!restaurant) {
            throw new BadRequestException(
                'No puedes pagar una reserva de un restaurante inactivo',
            );
        }
        
        const amountInCents = Math.round(Number(reservation.total_amount) *100);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: process.env.STRIPE_CURRENCY ??'usd',
            automatic_payment_methods: {
                enabled: true,
            },

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

    async handleStripeWebhook(rawBody: Buffer, signature: string,) {


        const webhookSecret =process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            throw new BadRequestException('Webhook secret no configurado',);
        }

        type StripeWebhookEvent = ReturnType<typeof this.stripe.webhooks.constructEvent>;

        let event: StripeWebhookEvent;

        try {
            event = this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                webhookSecret,
            );
        } catch {
            throw new BadRequestException('Firma inválida');
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as { id: string };

            const payment = await this.paymentRepo.findOne({
                where: {
                    stripe_payment_intent_id: paymentIntent.id,
                },
                relations: {
                    reservation: true,
                },
            });

            if (!payment) {
                throw new NotFoundException('Pago no encontrado',);
            }

            // Idempotencia: si ya procesamos este pago/evento, no hacemos nada.
            if (payment.status === PaymentStatus.PAID) {
                return {
                    received: true,
                };
            }

            if (payment.stripe_event_id && payment.stripe_event_id === event.id) {
                return {
                    received: true,
                };
            }

            const paidAt = new Date();

            await this.paymentRepo.manager.transaction(async (manager) => {
                payment.status = PaymentStatus.PAID;
                payment.paid_at = paidAt;
                payment.stripe_event_id = event.id;
                payment.stripe_payment_intent_id = paymentIntent.id;

                // Solo confirmamos la reserva si todavía está pendiente.
                if (payment.reservation.status === ReservationStatus.PENDING_PAYMENT) {
                    payment.reservation.status = ReservationStatus.CONFIRMED;
                    payment.reservation.paid_at = paidAt;
                    payment.reservation.confirmed_at = paidAt;
                    await manager.save(payment.reservation);
                }

                await manager.save(payment);
            });
        }
        return {
            received: true,
        };
    }
}
