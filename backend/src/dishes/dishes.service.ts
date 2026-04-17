import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createDishDto: CreateDishDto, user_id: string) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user || user.role !== UserRole.MANAGER || !user.restaurant_id) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    const dish = this.dishRepo.create({
      ...createDishDto,
      restaurant_id: user.restaurant_id,
    });

    return await this.dishRepo.save(dish);
  }

  async findAll() {
    return await this.dishRepo.find();
  }

  async findOne(id: string) {
    const dish = await this.dishRepo.findOne({
      where: { id },
    });

    if (!dish) {
      throw new NotFoundException('Plato no encontrado');
    }

    return dish;
  }

  async update(id: string, updateDishDto: UpdateDishDto) {
    const dish = await this.findOne(id);

    Object.assign(dish, updateDishDto);

    return await this.dishRepo.save(dish);
  }

  async remove(id: string) {
    const dish = await this.findOne(id);

    await this.dishRepo.remove(dish);

    return {
      message: 'Plato eliminado correctamente',
    };
  }
}
