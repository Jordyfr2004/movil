import {ConflictException,ForbiddenException,Injectable,NotFoundException, BadRequestException, Logger,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { UpdateRestaurantStatusDto } from './dto/update-restaurant-status.dto';
import { StorageService } from '../storage/storage.service';


@Injectable()
export class RestaurantsService {

  private readonly logger = new Logger(RestaurantsService.name)


  
  
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly storageService: StorageService,
    
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto,) {
    let { name, is_active } = createRestaurantDto;

    name = name.trim();

    const existingRestaurant =
      await this.restaurantRepo.findOne({
        where: { name },
      });

    if (existingRestaurant) {
      throw new ConflictException(
        'El restaurante ya existe',
      );
    }

    const restaurant = this.restaurantRepo.create({
      name,
      is_active: is_active ?? true,
    });

    const savedRestaurant =
      await this.restaurantRepo.save(restaurant);

    return {
      message: 'Restaurante creado correctamente',
      data: savedRestaurant,
    };
  }

  async findAll() {
    return await this.restaurantRepo.find({
      where: { is_active: true},
    });
  }

  async findOnePublic(id: string) {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        id,
        is_active: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurante no encontrado o inactivo',
      );
    }

    return restaurant;
  }

  async findAllForAdmin() {
    return this.restaurantRepo.find({
      order: {
        created_at: 'DESC',
      },
    });
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

  async update(id: string,updateRestaurantDto: UpdateRestaurantDto,user_id: string,) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new ForbiddenException(
        'No tienes permisos para esta acción',
      );
    }

    if (
      user.role !== UserRole.MANAGER &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'No tienes permisos para esta acción',
      );
    }

    if (
      user.role === UserRole.MANAGER &&
      user.restaurant_id !== id
    ) {
      throw new ForbiddenException(
        'Solo puedes editar el restaurante que tienes asignado',
      );
    }

    const restaurant = await this.findOne(id);

    if (updateRestaurantDto.name !== undefined) {
      const name = updateRestaurantDto.name.trim();

      const existingRestaurant =
        await this.restaurantRepo.findOne({
          where: { name },
        });

      if (
        existingRestaurant &&
        existingRestaurant.id !== id
      ) {
        throw new ConflictException(
          'El restaurante ya existe',
        );
      }

      restaurant.name = name;
    }

    const savedRestaurant =
      await this.restaurantRepo.save(restaurant);

    return {
      message: 'Restaurante actualizado correctamente',
      data: savedRestaurant,
    };
  }

  async updateStatus(id: string,updateRestaurantStatusDto: UpdateRestaurantStatusDto,) {
    const restaurant = await this.findOne(id);

    restaurant.is_active =
      updateRestaurantStatusDto.is_active;

    const savedRestaurant =
      await this.restaurantRepo.save(restaurant);

    return {
      message: savedRestaurant.is_active
        ? 'Restaurante activado correctamente'
        : 'Restaurante desactivado correctamente',
      data: savedRestaurant,
    };
  }

  async updateMyRestaurantImage(userId: string,image: any,) {
    if (!image) {
      throw new BadRequestException(
        'Debes seleccionar una imagen',
      );
    }

    const manager = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (
      !manager ||
      manager.role !== UserRole.MANAGER
    ) {
      throw new ForbiddenException(
        'Solo los managers pueden subir la imagen del comedor',
      );
    }

    if (!manager.restaurant_id) {
      throw new ForbiddenException(
        'No tienes un restaurante asignado',
      );
    }

    const restaurant = await this.findOne(
      manager.restaurant_id,
    );

    const previousImagePath = restaurant.image_path;

    const uploadedImage =
      await this.storageService.uploadRestaurantImage(
        image,
        restaurant.id,
      );

    restaurant.image_url = uploadedImage.url;
    restaurant.image_path = uploadedImage.path;

    const savedRestaurant =
      await this.restaurantRepo.save(restaurant);

    if (previousImagePath) {
      try {
        await this.storageService.deleteRestaurantImage(
          previousImagePath,
        );
      } catch {
        this.logger.warn(`No se pudo eliminar la imagen anterior del restaurante ${restaurant.id}`,);
      }
    }

    return {
      message:
        'Imagen del comedor actualizada correctamente',
      data: savedRestaurant,
    };
  }

  async remove(id: string) {
    const restaurant = await this.findOne(id);

    await this.restaurantRepo.remove(restaurant);

    return {
      message: 'Restaurante eliminado correctamente',
    };
  }
}
