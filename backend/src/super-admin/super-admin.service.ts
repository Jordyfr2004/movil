import {BadRequestException,Injectable,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { AssignManagerDto } from './dto/assign-manager.dto';
import {ManageableUserRole,UpdateUserRoleDto,} from './dto/update-user-role.dto';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';



@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,


    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,

  ) {}

  async findAllUsers() {
    return this.userRepo.find({
      relations: {
        restaurant: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async assignManager(assignManagerDto: AssignManagerDto) {
    const { user_id, restaurant_id } = assignManagerDto;

    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (
      !user.is_active ||
      user.status !== UserStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'No puedes asignar como manager a un usuario inactivo o suspendido',
      );
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException(
        'No puedes asignar un super administrador como manager',
      );
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: {
        id: restaurant_id,
        is_active: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurante no encontrado o inactivo',
      );
    }

    user.role = UserRole.MANAGER;
    user.restaurant_id = restaurant.id;

    const savedUser = await this.userRepo.save(user);

    await this.revokeUserRefreshTokens(user.id);

    return {
      message: 'Manager asignado correctamente',
      data: savedUser,
    };
  }

  async updateUserRole(updateUserRoleDto: UpdateUserRoleDto,) {
    const { user_id, role } = updateUserRoleDto;

    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException(
        'No puedes modificar el rol de un super administrador',
      );
    }

    if (role === ManageableUserRole.STUDENT) {
      user.role = UserRole.STUDENT;
      user.restaurant_id = null;
    }

    if (role === ManageableUserRole.MANAGER) {
      if (
        !user.is_active ||
        user.status !== UserStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'No puedes establecer como manager a un usuario inactivo o suspendido',
        );
      }

      if (!user.restaurant_id) {
        throw new BadRequestException(
          'Debes asignar un restaurante antes de establecer el rol manager',
        );
      }

      user.role = UserRole.MANAGER;
    }

    const savedUser = await this.userRepo.save(user);

    await this.revokeUserRefreshTokens(savedUser.id);

    return {
      message: 'Rol actualizado correctamente',
      data: savedUser,
    };
  }

  async updateUserStatus(updateUserStatusDto: UpdateUserStatusDto,) {
    const { user_id, status } = updateUserStatusDto;

    const user = await this.userRepo.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException(
        'No puedes modificar el estado de un super administrador',
      );
    }

    user.status = status;
    user.is_active = status === UserStatus.ACTIVE;

    const savedUser = await this.userRepo.save(user);

    if (status !== UserStatus.ACTIVE) {
      await this.revokeUserRefreshTokens(savedUser.id);
    }

    return {
      message: 'Estado del usuario actualizado correctamente',
      data: savedUser,
    };
  }

  private async revokeUserRefreshTokens(userId: string,): Promise<void> {
    await this.refreshTokenRepo.update(
      {
        user_id: userId,
        is_revoked: false,
      },
      {
        is_revoked: true,
      },
    );
  }
}