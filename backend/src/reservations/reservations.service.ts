import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dish } from '../dishes/entities/dish.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateReservationDto,
  CreateReservationItemDto,
} from './dto/create-reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationItem } from './entities/reservation-item.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(ReservationItem)
    private readonly reservationItemRepo: Repository<ReservationItem>,

    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createReservationDto: CreateReservationDto, user_id: string) {
    const user = await this.userRepo.findOne({ where: { id: user_id } });
    if (!user) {
      throw new ForbiddenException('Usuario no válido');
    }

    const items = Array.isArray(createReservationDto?.items)
      ? createReservationDto.items
      : [];

    if (items.length === 0) {
      throw new BadRequestException('Debes enviar al menos un plato');
    }

    const targetDishId = items[0].dish_id;

    const existingForDish = await this.reservationRepo
      .createQueryBuilder('reservation')
      .innerJoin('reservation.items', 'item')
      .where('reservation.user_id = :user_id', { user_id })
      .andWhere('reservation.status = :status', {
        status: ReservationStatus.CONFIRMED,
      })
      .andWhere('item.dish_id = :dish_id', { dish_id: targetDishId })
      .getOne();

    if (existingForDish) {
      throw new BadRequestException('Ya reservaste este plato.');
    }

    const uniqueDishIds = Array.from(new Set(items.map((x) => x.dish_id)));

    const dishes = await this.dishRepo.find({
      where: {
        id: In(uniqueDishIds),
        is_active: true,
        is_available: true,
      },
    });

    const dishById = new Map(dishes.map((d) => [d.id, d] as const));

    for (const item of items) {
      const dish = dishById.get(item.dish_id);
      if (!dish) {
        throw new NotFoundException(
          'Uno o más platos no existen o no están disponibles',
        );
      }
    }

    return this.reservationRepo.manager.transaction(async (manager) => {
      const reservation = manager.create(Reservation, {
        user_id,
        status: ReservationStatus.CONFIRMED,
        items: [],
      });

      const savedReservation = await manager.save(Reservation, reservation);

      const reservationItems = items.map((item: CreateReservationItemDto) => {
        const dish = dishById.get(item.dish_id)!;
        return manager.create(ReservationItem, {
          reservation_id: savedReservation.id,
          dish_id: dish.id,
          dish_name: dish.name,
          dish_description: dish.description,
          restaurant_id: dish.restaurant_id,
          unit_price: dish.price,
        });
      });

      await manager.save(ReservationItem, reservationItems);

      const created = await manager.findOne(Reservation, {
        where: { id: savedReservation.id },
        relations: { items: true },
      });

      return {
        message: 'Reserva creada correctamente',
        data: created,
      };
    });
  }

  async findMyReservations(user_id: string) {
    return {
      message: 'Reservas obtenidas correctamente',
      data: await this.reservationRepo.find({
        where: { user_id },
        relations: { items: true },
        order: { created_at: 'DESC' },
      }),
    };
  }

  async cancel(reservationId: string, user_id: string) {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.user_id !== user_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      return {
        message: 'La reserva ya estaba cancelada',
        data: reservation,
      };
    }

    reservation.status = ReservationStatus.CANCELLED;

    const saved = await this.reservationRepo.save(reservation);

    return {
      message: 'Reserva cancelada correctamente',
      data: saved,
    };
  }
}
