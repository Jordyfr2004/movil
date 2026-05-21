import {Injectable,NotFoundException,ForbiddenException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly notificationsService: NotificationsService,

  ) {}

  private normalizeDescription(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async create(createDishDto: CreateDishDto, user_id: string) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER || !user.restaurant_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    const existingActiveDishes = await this.dishRepo.count({
      where: {
        restaurant_id: user.restaurant_id,
        is_active: true,
      }
    })

    const dish = this.dishRepo.create({
      ...createDishDto,
      description: this.normalizeDescription(createDishDto.description),
      restaurant_id: user.restaurant_id,
    });

    const saveDish = await this.dishRepo.save(dish);

    if (saveDish.is_active && saveDish.is_available) {
      this.notificationsService.notifyDishCreated(saveDish);
    }

    if (existingActiveDishes === 0) {
      this.notificationsService.notifyMenuAvailable(
        user.restaurant_id,
      )
    }

    return saveDish;
  }

  async findAllByManager(user_id: string) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER || !user.restaurant_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    return await this.dishRepo.find({
      // El manager necesita ver también los platos inactivos para poder
      // volver a activarlos (ocultar/mostrar).
      where: { restaurant_id: user.restaurant_id },
    });
  }

  async findPublicByRestaurant(restaurant_id: string) {
    return await this.dishRepo.find({
      where: {
        restaurant_id,
        is_active: true,
        is_available: true,
      },
    });
  }

  async findOneForManager(id: string, user_id: string) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER || !user.restaurant_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    const dish = await this.dishRepo.findOne({
      where: { id },
    });

    if (!dish) {
      throw new NotFoundException('Plato no encontrado');
    }

    if (dish.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('No tienes permisos para ver este plato');
    }

    return dish;
  }

  async update(id: string, updateDishDto: UpdateDishDto, user_id: string) {
    const dish = await this.findOneForManager(id, user_id);

    const previousAvailability = dish.is_available;

    Object.assign(dish, updateDishDto);

    if (updateDishDto.description !== undefined) {
      dish.description = this.normalizeDescription(updateDishDto.description);
    }

    const saveDish = await this.dishRepo.save(dish);

    if (previousAvailability === true && saveDish.is_available === false ) {
      this.notificationsService.notifyDishHidden(
        saveDish.id,
        saveDish.restaurant_id,
      );
    } else if (previousAvailability === false && saveDish.is_available === true) {
      this.notificationsService.notifyDishAvailable(
        saveDish.id,
        saveDish.restaurant_id,
      );

      this.notificationsService.notifyDishCreated(saveDish);
    } else if (saveDish.is_active && saveDish.is_available) {
      this.notificationsService.notifyDishUpdated(saveDish);
    }
    return saveDish;
  }

  async remove(id: string, user_id: string) {
    const dish = await this.findOneForManager(id, user_id);

    const dishId = dish.id;
    const restaurantId = dish.restaurant_id;

    await this.dishRepo.remove(dish);
    this.notificationsService.notifyDishDeleted(dishId, restaurantId);

    return {
      message: 'Plato eliminado correctamente',
    };
  }
}
