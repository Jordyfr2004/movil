import {BadRequestException,ForbiddenException,Injectable,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dish } from '../dishes/entities/dish.entity';
import { User, UserRole } from '../users/entities/user.entity';
import {CreateReservationDto,CreateReservationItemDto,} from './dto/create-reservation.dto';
import {Reservation,ReservationStatus,} from './entities/reservation.entity';
import { ReservationItem } from './entities/reservation-item.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createReservationDto: CreateReservationDto,user_id: string,) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new ForbiddenException('Usuario no válido');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden hacer reservas',
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

    const reservationDate = new Date()
    .toISOString()
    .split('T')[0];

    const existingReservation = await this.reservationRepo.findOne({
        where: [
          {
            user_id,
            reservation_date: reservationDate,
            status: ReservationStatus.PENDING_PAYMENT,
          },
          {
            user_id,
            reservation_date: reservationDate,
            status: ReservationStatus.CONFIRMED,
          },
        ],
      });

    if (existingReservation) {
      throw new BadRequestException(
        'Ya tienes una reserva activa para este restaurante',
      );
    }

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
      message:'Reservas obtenidas correctamente',
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

  async cancel(reservationId: string,user_id: string,) {
    const reservation = await this.reservationRepo.findOne({
        where: { id: reservationId },
      });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.user_id !== user_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
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

    reservation.status = ReservationStatus.CANCELLED;

    const saved =await this.reservationRepo.save(reservation,);

    return {
      message:'Reserva cancelada correctamente',
      data: saved,
    };
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
