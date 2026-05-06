import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthAccount } from 'src/auth/entities/auth-account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(AuthAccount)
    private readonly authAccountRepo: Repository<AuthAccount>,
  ) {}


  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return  await this.userRepo.find();
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id }});

    if (!user) {
       throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async getMyProfile(userId?: string, emailFromToken?: string) {
    if (!userId) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const user = await this.findOne(userId);

    const authAccount = await this.authAccountRepo.findOne({
      where: { user_id: userId },
      select: {
        email: true,
        provider: true,
        is_verified: true,
        created_at: true,
      } as any,
    });

    return {
      message: 'Perfil obtenido correctamente',
      data: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        is_active: user.is_active,
        restaurant_id: user.restaurant_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email: authAccount?.email ?? emailFromToken ?? null,
        provider: authAccount?.provider ?? null,
        is_verified: authAccount?.is_verified ?? null,
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);

    return await this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await  this.userRepo.remove(user);
    return {
      message: 'Usuario eliminado correctamente',
    }
  }
}
