import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
