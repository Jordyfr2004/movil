import {ForbiddenException,Injectable,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';
import { Restaurant } from '../restaurants/entities/restaurant.entity';




@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly notificationsService: NotificationsService,

    private readonly storageService: StorageService,


    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

  ) {}

  private normalizeDescription(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  private async getManagerRestaurantId(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        restaurant_id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.restaurant_id) {
      throw new ForbiddenException(
        'No tienes un restaurante asignado',
      );
    }

    return user.restaurant_id;
  }

  async create(
    createDishDto: CreateDishDto,userId: string,image?: any,) {
    const restaurantId = await this.getManagerRestaurantId(userId);

    await this.ensureRestaurantIsActive(restaurantId);

    const existingActiveDishes = await this.dishRepo.count({
      where: {
        restaurant_id: restaurantId,
        is_active: true,
      },
    });

    let imageUrl: string | null = null;
    let imagePath: string | null = null;

    if (image) {
      const uploadedImage =
        await this.storageService.uploadDishImage(
          image,
          restaurantId,
        );

      imageUrl = uploadedImage.url;
      imagePath = uploadedImage.path;
    }

    const dish = this.dishRepo.create({...createDishDto,description: this.normalizeDescription(createDishDto.description,),
      restaurant_id: restaurantId,
      image_url: imageUrl,
      image_path: imagePath,
    });

    const savedDish = await this.dishRepo.save(dish);

    if (savedDish.is_active && savedDish.is_available) {
      this.notificationsService.notifyDishCreated(savedDish);
    }

    if (existingActiveDishes === 0) {
      this.notificationsService.notifyMenuAvailable(restaurantId);
    }

    return savedDish;
  }

  async findAllByManager(userId: string) {
    const restaurantId = await this.getManagerRestaurantId(userId);

    return this.dishRepo.find({
      where: {
        restaurant_id: restaurantId,
      },
    });
  }

  async findPublicByRestaurant(restaurantId: string,) {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        id: restaurantId,
        is_active: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurante no encontrado o inactivo',
      );
    }

    return this.dishRepo.find({
      where: {
        restaurant_id: restaurantId,
        is_active: true,
        is_available: true,
      },
    });
  }

  async findOneForManager(id: string, userId: string) {
    const restaurantId = await this.getManagerRestaurantId(userId);

    const dish = await this.dishRepo.findOne({
      where: { id },
    });

    if (!dish) {
      throw new NotFoundException('Plato no encontrado');
    }

    if (dish.restaurant_id !== restaurantId) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar este plato',
      );
    }

    return dish;
  }

  async update(id: string,updateDishDto: UpdateDishDto,userId: string,) {
    const dish = await this.findOneForManager(id, userId);

    await this.ensureRestaurantIsActive(dish.restaurant_id,);

    const previousAvailability = dish.is_available;

    Object.assign(dish, updateDishDto);

    if (updateDishDto.description !== undefined) {
      dish.description = this.normalizeDescription(
        updateDishDto.description,
      );
    }

    const savedDish = await this.dishRepo.save(dish);

    if (previousAvailability === true &&savedDish.is_available === false) {
      this.notificationsService.notifyDishHidden(
        savedDish.id,
        savedDish.restaurant_id,
      );
    } else if (previousAvailability === false && savedDish.is_available === true) {
      this.notificationsService.notifyDishAvailable(
        savedDish.id,
        savedDish.restaurant_id,
      );

      this.notificationsService.notifyDishCreated(savedDish);
    } else if (savedDish.is_active && savedDish.is_available) {
      this.notificationsService.notifyDishUpdated(savedDish);
    }

    return savedDish;
  }

  async remove(id: string, userId: string) {
    const dish = await this.findOneForManager(id, userId);

    await this.ensureRestaurantIsActive(dish.restaurant_id);

    const dishId = dish.id;
    const restaurantId = dish.restaurant_id;

    if (dish.image_path) {
      await this.storageService.deleteDishImage(dish.image_path);
    }

    await this.dishRepo.remove(dish);

    this.notificationsService.notifyDishDeleted(
      dishId,
      restaurantId,
    );

    return {
      message: 'Plato eliminado correctamente',
    };
  }

  private async ensureRestaurantIsActive(restaurantId: string,): Promise<void> {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        id: restaurantId,
        is_active: true,
      },
    });

    if (!restaurant) {
      throw new ForbiddenException(
        'El restaurante está inactivo',
      );
    }
  }
}
