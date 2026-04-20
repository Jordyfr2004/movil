import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto, user_id: string) {
    let { name, is_active } = createRestaurantDto;

    name = name.trim();

    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    if (user.restaurant_id) {
      throw new ConflictException('El manager ya tiene un restaurante asignado');
    }

    const existingRestaurant = await this.restaurantRepo.findOne({
      where: { name },
    });

    if (existingRestaurant) {
      throw new ConflictException('El restaurante ya existe');
    }

    const restaurant = this.restaurantRepo.create({
      name,
      is_active,
    });

    const savedRestaurant = await this.restaurantRepo.save(restaurant);

    user.restaurant_id = savedRestaurant.id;
    await this.userRepo.save(user);

    return {
      message: 'Restaurante creado y asignado correctamente',
      data: savedRestaurant,
    };
  }

  async findAll() {
    return await this.restaurantRepo.find();
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    user_id: string,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER || user.restaurant_id !== id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    const restaurant = await this.findOne(id);

    if (updateRestaurantDto.name) {
      updateRestaurantDto.name = updateRestaurantDto.name.trim();

      const existingRestaurant = await this.restaurantRepo.findOne({
        where: { name: updateRestaurantDto.name },
      });

      if (existingRestaurant && existingRestaurant.id !== id) {
        throw new ConflictException('El restaurante ya existe');
      }
    }

    Object.assign(restaurant, updateRestaurantDto);

    return await this.restaurantRepo.save(restaurant);
  }

  async remove(id: string, user_id: string) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER || user.restaurant_id !== id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    const restaurant = await this.findOne(id);

    await this.restaurantRepo.remove(restaurant);

    user.restaurant_id = null;
    await this.userRepo.save(user);

    return {
      message: 'Restaurante eliminado correctamente',
    };
  }
}
