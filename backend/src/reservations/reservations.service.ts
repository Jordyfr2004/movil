import {BadRequestException,ForbiddenException,Injectable,NotFoundException,Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import Stripe from 'stripe';
import { Dish } from '../dishes/entities/dish.entity';
import { User, UserRole } from '../users/entities/user.entity';
import {CreateReservationDto,CreateReservationItemDto,} from './dto/create-reservation.dto';
import {Reservation,ReservationStatus,ReservationDeliveryStatus} from './entities/reservation.entity';
import { ReservationItem } from './entities/reservation-item.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { PaymentStatus, Payment } from '../payments/entities/payment.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { createHash, randomBytes } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';




@Injectable()
export class ReservationsService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    private readonly notificationsService: NotificationsService,

  ) {}

  async create(createReservationDto: CreateReservationDto,user_id: string,) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new ForbiddenException('Usuario no válido');
    }

    if (user.role !== UserRole.STUDENT && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Solo los estudiantes y managers pueden hacer reservas'
      );
    }

    const items = Array.isArray(createReservationDto?.items) ? createReservationDto.items: [];

    if (items.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un plato',
      );
    }

    const uniqueDishIds = Array.from(
      new Set(items.map((item) => item.dish_id)),
    );

    const dishes = await this.dishRepo.find({
      where: {
        id: In(uniqueDishIds),
        is_active: true,
        is_available: true,
      },
    });

    const dishById = new Map(
      dishes.map((dish) => [dish.id, dish] as const),
    );

    for (const item of items) {
      const dish = dishById.get(item.dish_id);

      if (!dish) {
        throw new NotFoundException(
          'Uno o más platos no existen o no están disponibles',
        );
      }

      if (!item.quantity || item.quantity < 1) {
        throw new BadRequestException(
          'La cantidad debe ser mayor a 0',
        );
      }
    }

    const firstDish = dishById.get(items[0].dish_id)!;

    const hasDifferentRestaurant = items.some((item) => {
      const dish = dishById.get(item.dish_id)!;

      return dish.restaurant_id !== firstDish.restaurant_id;
    });

    if (hasDifferentRestaurant) {
      throw new BadRequestException(
        'Todos los platos deben pertenecer al mismo restaurante',
      );
    }
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        id: firstDish.restaurant_id,
        is_active: true,
      },
    });

    if (!restaurant) {
      throw new BadRequestException(
        'No puedes reservar platos de un restaurante inactivo',
      );
    }

    const reservationDate = new Date()
    .toISOString()
    .split('T')[0];

    

    const totalAmount = items.reduce((total, item) => {
      const dish = dishById.get(item.dish_id)!;

      return (
        total +
        Number(dish.price) * item.quantity
      );
    }, 0);

    const expiresAt = new Date();

    expiresAt.setMinutes(expiresAt.getMinutes() + 30,);

    return this.reservationRepo.manager.transaction(
      async (manager) => { const reservation = manager.create(Reservation,{
            user_id,
            restaurant_id: firstDish.restaurant_id,
            status: ReservationStatus.PENDING_PAYMENT,
            total_amount: totalAmount.toFixed(2),
            reservation_date: reservationDate,
            expires_at: expiresAt,
            paid_at: null,
            confirmed_at: null,
            delivered_at: null,
            delivered_by: null,
            pickup_token_hash: null,
            pickup_token_expires_at: null,
            items: [],
          },
        );

        const savedReservation = await manager.save(Reservation,reservation,);

        const reservationItems = items.map((item: CreateReservationItemDto) => {

            const dish = dishById.get( item.dish_id,)!;

            return manager.create(ReservationItem,{
                reservation_id: savedReservation.id,
                dish_id: dish.id,
                dish_name: dish.name,
                dish_description: dish.description,
                restaurant_id: dish.restaurant_id,
                unit_price: dish.price,
                quantity: item.quantity,
              },
            );
          },
        );

        await manager.save(ReservationItem,reservationItems,);

        const created = await manager.findOne(
          Reservation,
          {
            where: {
              id: savedReservation.id,
            },
            relations: {
              items: true,
            },
          },
        );

        return {
          message:'Reserva pendiente de pago creada correctamente',
          data: created,
        };
      },
    );
  }

  async findMyReservations(user_id: string) {
    return {
      message: 'Reservas obtenidas correctamente',
      data: await this.reservationRepo.find({
        where: { user_id },
        relations: {
          items: true,
        },
        order: {
          created_at: 'DESC',
        },
      }),
    };
  }

  async generatePickupQr(reservationId: string,userId: string,) {
    const reservation = await this.reservationRepo.findOne({
      where: {
        id: reservationId,
      },
      relations: {
        payments: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(
        'Reserva no encontrada',
      );
    }

    if (reservation.user_id !== userId) {
      throw new ForbiddenException(
        'La reserva no pertenece al usuario',
      );
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Solo puedes generar el QR de una reserva pagada y pendiente de entrega',
      );
    }

    const hasPaidPayment =
      Array.isArray(reservation.payments) &&
      reservation.payments.some(
        (payment) => payment.status === PaymentStatus.PAID,
      );

    if (!hasPaidPayment) {
      throw new BadRequestException(
        'La reserva no tiene un pago confirmado',
      );
    }

    if (
      reservation.delivered_at ||
      reservation.delivered_by
    ) {
      throw new BadRequestException(
        'La reserva ya fue entregada',
      );
    }

    const pickupToken = randomBytes(32).toString('hex');

    const pickupTokenHash = createHash('sha256')
      .update(pickupToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    reservation.pickup_token_hash = pickupTokenHash;
    reservation.pickup_token_expires_at = expiresAt;

    await this.reservationRepo.save(reservation);

    return {
      message: 'Token QR generado correctamente',
      data: {
        pickup_token: pickupToken,
        expires_at: expiresAt,
      },
    };
  }


  async verifyPickupQr(pickupToken: string,managerId: string,) {
    const manager = await this.userRepo.findOne({
      where: {
        id: managerId,
      },
    });

    if (!manager || manager.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Solo los managers pueden verificar entregas',
      );
    }

    if (!manager.restaurant_id) {
      throw new BadRequestException(
        'El manager no tiene un restaurante asignado',
      );
    }

    const pickupTokenHash = createHash('sha256')
      .update(pickupToken)
      .digest('hex');

    const reservation = await this.reservationRepo.findOne({
      where: {
        pickup_token_hash: pickupTokenHash,
      },
      relations: {
        user: true,
        items: true,
        payments: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(
        'Código QR inválido',
      );
    }

    if (
      !reservation.pickup_token_expires_at ||
      reservation.pickup_token_expires_at.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'El código QR ha expirado',
      );
    }

    if (reservation.restaurant_id !== manager.restaurant_id) {
      throw new ForbiddenException(
        'La reserva no pertenece al restaurante del manager',
      );
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException(
        'La reserva ya fue entregada',
      );
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'La reserva no está pagada o pendiente de entrega',
      );
    }

    const hasPaidPayment =
      Array.isArray(reservation.payments) &&
      reservation.payments.some(
        (payment) => payment.status === PaymentStatus.PAID,
      );

    if (!hasPaidPayment) {
      throw new BadRequestException(
        'La reserva no tiene un pago confirmado',
      );
    }

    return {
      message: 'Código QR verificado correctamente',
      data: {
        reservation_id: reservation.id,
        reservation_date: reservation.reservation_date,
        status: reservation.status,
        delivery_status:
          ReservationDeliveryStatus.PENDING_DELIVERY,
        total_amount: reservation.total_amount,
        user: {
          id: reservation.user.id,
          full_name: reservation.user.full_name,
        },
        items: reservation.items.map((item) => ({
          dish_id: item.dish_id,
          dish_name: item.dish_name,
          unit_price: item.unit_price,
          quantity: item.quantity,
        })),
      },
    };
  }

  async confirmPickupDelivery(pickupToken: string,managerId: string,) {
    const managerUser = await this.userRepo.findOne({
      where: {
        id: managerId,
      },
    });

    if (!managerUser ||managerUser.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Solo los managers pueden confirmar entregas',
      );
    }

    if (!managerUser.restaurant_id) {
      throw new BadRequestException(
        'El manager no tiene un restaurante asignado',
      );
    }

    const pickupTokenHash = createHash('sha256')
      .update(pickupToken)
      .digest('hex');

    const result =await this.reservationRepo.manager.transaction(
        async (transactionManager) => {
          const reservationRepo =
            transactionManager.getRepository(Reservation);

          const paymentRepo =
            transactionManager.getRepository(Payment);

          const reservation = await reservationRepo.findOne({
            where: {
              pickup_token_hash: pickupTokenHash,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          });

          if (!reservation) {
            throw new NotFoundException(
              'Código QR inválido',
            );
          }

          if (
            !reservation.pickup_token_expires_at ||
            reservation.pickup_token_expires_at.getTime() <
              Date.now()
          ) {
            throw new BadRequestException(
              'El código QR ha expirado',
            );
          }

          if (
            reservation.restaurant_id !==
            managerUser.restaurant_id
          ) {
            throw new ForbiddenException(
              'La reserva no pertenece al restaurante del manager',
            );
          }

          if (
            reservation.status ===
            ReservationStatus.COMPLETED
          ) {
            throw new BadRequestException(
              'La reserva ya fue entregada',
            );
          }

          if (
            reservation.status !==
            ReservationStatus.CONFIRMED
          ) {
            throw new BadRequestException(
              'La reserva no está pagada o pendiente de entrega',
            );
          }

          const hasPaidPayment = await paymentRepo.exists({
            where: {
              reservation_id: reservation.id,
              status: PaymentStatus.PAID,
            },
          });

          if (!hasPaidPayment) {
            throw new BadRequestException(
              'La reserva no tiene un pago confirmado',
            );
          }

          const deliveredAt = new Date();

          reservation.status =
            ReservationStatus.COMPLETED;

          reservation.delivered_at = deliveredAt;
          reservation.delivered_by = managerUser.id;

          reservation.pickup_token_hash = null;
          reservation.pickup_token_expires_at = null;

          await reservationRepo.save(reservation);

          return {
            reservation_id: reservation.id,
            user_id: reservation.user_id,
            status: reservation.status,
            delivery_status:
              ReservationDeliveryStatus.DELIVERED,
            delivered_at: deliveredAt,
            delivered_by: managerUser.id,
          };
        },
      );

    try {
      await this.notificationsService.notifyReservationDelivered(
        result.user_id,
        {
          reservation_id: result.reservation_id,
          status: result.status,
          delivery_status: result.delivery_status,
          delivered_at: result.delivered_at,
          message:
            'Tu reserva fue entregada correctamente',
        },
      );
    } catch (error: unknown) {
      this.logger.error(
        `La reserva ${result.reservation_id} fue entregada, pero falló la notificación`,
        error instanceof Error
          ? error.stack
          : String(error),
      );
    }

    return {
      message: 'Reserva entregada correctamente',
      data: result,
    };
  }

  async findRestaurantReservations(managerId: string) {
    const manager = await this.userRepo.findOne({
      where: {
        id: managerId,
      },
    });

    if (!manager || manager.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Solo los managers pueden consultar las reservas del restaurante',
      );
    }

    if (!manager.restaurant_id) {
      throw new BadRequestException(
        'El manager no tiene un restaurante asignado',
      );
    }

    const reservations = await this.reservationRepo.find({
      where: {
        restaurant_id: manager.restaurant_id,
      },
      relations: {
        user: true,
        items: true,
      },
      order: {
        reservation_date: 'DESC',
        created_at: 'DESC',
      },
    });

    return {
      message: 'Reservas del restaurante obtenidas correctamente',
      data: reservations.map((reservation) => ({
        id: reservation.id,
        reservation_date: reservation.reservation_date,
        status: reservation.status,
        delivery_status: this.getDeliveryStatus(
          reservation.status,
        ),
        total_amount: reservation.total_amount,
        delivered_at: reservation.delivered_at,
        user: {
          id: reservation.user.id,
          full_name: reservation.user.full_name,
        },
        items: reservation.items.map((item) => ({
          dish_id: item.dish_id,
          dish_name: item.dish_name,
          unit_price: item.unit_price,
          quantity: item.quantity,
        })),
      })),
    };
  }

  async getDeliveryReceipt(reservationId: string,userId: string,) {
    const reservation = await this.reservationRepo.findOne({
      where: {
        id: reservationId,
      },
      relations: {
        user: true,
        items: true,
        payments: true,
        delivered_by_user: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(
        'Reserva no encontrada',
      );
    }

    if (reservation.user_id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para consultar este comprobante',
      );
    }

    if (
      reservation.status !== ReservationStatus.COMPLETED ||
      !reservation.delivered_at
    ) {
      throw new BadRequestException(
        'El comprobante estará disponible cuando la reserva sea entregada',
      );
    }

    const paidPayment = reservation.payments
      .filter(
        (payment) =>
          payment.status === PaymentStatus.PAID,
      )
      .sort((a, b) => {
        const dateA = a.paid_at
          ? new Date(a.paid_at).getTime()
          : new Date(a.created_at).getTime();

        const dateB = b.paid_at
          ? new Date(b.paid_at).getTime()
          : new Date(b.created_at).getTime();

        return dateB - dateA;
      })[0];

    if (!paidPayment) {
      throw new BadRequestException(
        'La reserva no tiene un pago confirmado',
      );
    }

    const restaurant =
      await this.restaurantRepo.findOne({
        where: {
          id: reservation.restaurant_id,
        },
      });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurante no encontrado',
      );
    }

    return {
      message: 'Comprobante obtenido correctamente',
      data: {
        receipt_number: reservation.id,

        reservation: {
          id: reservation.id,
          reservation_date:
            reservation.reservation_date,
          status: reservation.status,
          delivery_status:
            ReservationDeliveryStatus.DELIVERED,
          created_at: reservation.created_at,
        },

        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
        },

        customer: {
          id: reservation.user.id,
          full_name: reservation.user.full_name,
        },

        items: reservation.items.map((item) => ({
          dish_id: item.dish_id,
          dish_name: item.dish_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: (
            Number(item.unit_price) * item.quantity
          ).toFixed(2),
        })),

        payment: {
          id: paidPayment.id,
          status: paidPayment.status,
          amount: paidPayment.amount,
          currency: paidPayment.currency,
          paid_at: paidPayment.paid_at,
        },

        delivery: {
          delivered_at: reservation.delivered_at,
          delivered_by: reservation.delivered_by_user
            ? {
                id: reservation.delivered_by_user.id,
                full_name:
                  reservation.delivered_by_user.full_name,
              }
            : null,
        },

        total_amount: reservation.total_amount,
      },
    };
  }

  async cancel(reservationId: string,user_id: string,) {
    const reservation = await this.reservationRepo.findOne({
        where: { id: reservationId },
        relations: {
          payments: true,
        },
      });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.user_id !== user_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    // Si ya existe un pago marcado como PAID en BD, no se puede cancelar.
    if (Array.isArray(reservation.payments) && reservation.payments.some((p) => p.status === PaymentStatus.PAID)) {
      throw new BadRequestException('No puedes cancelar una reserva pagada');
    }

    // Cierra la ventana: si Stripe ya lo marcó como succeeded pero el webhook aún no corrió, bloqueamos la cancelación.
    const latestPayment = Array.isArray(reservation.payments)
      ? reservation.payments
          .filter((p) => !!p.stripe_payment_intent_id)
          .sort((a, b) => {
            const aTime = a.created_at instanceof Date ? a.created_at.getTime() : new Date(a.created_at as any).getTime();
            const bTime = b.created_at instanceof Date ? b.created_at.getTime() : new Date(b.created_at as any).getTime();
            return bTime - aTime;
          })[0]
      : undefined;

    if (latestPayment?.stripe_payment_intent_id) {
      try {
        const intent = await this.stripe.paymentIntents.retrieve(latestPayment.stripe_payment_intent_id);
        if (intent.status === 'succeeded') {
          throw new BadRequestException('No puedes cancelar una reserva pagada');
        }
      } catch (err) {
        // Si Stripe falla, no asumimos pago; seguimos con las validaciones por estado.
        if (err instanceof BadRequestException) {
          throw err;
        }
      }
    }

    if (reservation.status === ReservationStatus.CONFIRMED){
      throw new BadRequestException('No puedes cancelar una reserva confirmada');
    }

    if (reservation.status ===ReservationStatus.CANCELLED) {
      return {
        message:'La reserva ya estaba cancelada',
        data: reservation,
      };
    }

    if (reservation.status === ReservationStatus.EXPIRED) {
      throw new BadRequestException('No puedes cancelar una reserva expirada');
    }
    
    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('No puedes cancelar una reserva completada');
    }

    if (reservation.status !== ReservationStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Solo puedes cancelar una reserva pendiente de pago');
    }

    reservation.status = ReservationStatus.CANCELLED;

    const saved =await this.reservationRepo.save(reservation,);

    return {
      message:'Reserva cancelada correctamente',
      data: saved,
    };
  }

  private getDeliveryStatus(status: ReservationStatus,): ReservationDeliveryStatus {
    if (status === ReservationStatus.CONFIRMED) {
      return ReservationDeliveryStatus.PENDING_DELIVERY;
    }

    if (status === ReservationStatus.COMPLETED) {
      return ReservationDeliveryStatus.DELIVERED;
    }

    return ReservationDeliveryStatus.NOT_AVAILABLE;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expirePendingReservations() {
    await this.reservationRepo.update(
      {
        status: ReservationStatus.PENDING_PAYMENT,
        expires_at: LessThan(new Date()),
      },
      {
        status: ReservationStatus.EXPIRED,
      },
    );
  }
}
