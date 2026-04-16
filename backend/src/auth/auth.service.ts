import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { AuthAccount, AuthProvider } from './entities/auth-account.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthAccount)
    private readonly authRepo: Repository<AuthAccount>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(registerAuthDto: RegisterAuthDto) {
    let { full_name, email, password } = registerAuthDto;

    full_name = full_name.trim();
    email = email.trim().toLowerCase();

    const existingAccount = await this.authRepo.findOne({
      where: { email },
    });

    if (existingAccount) {
      throw new ConflictException('El correo ya está registrado');
    }

    const newUser = this.userRepo.create({
      full_name,
      role: UserRole.STUDENTS,
    });

    const savedUser = await this.userRepo.save(newUser);

    const passwordHash = await argon2.hash(password);

    const authAccount = this.authRepo.create({
      user_id: savedUser.id,
      provider: AuthProvider.LOCAL,
      email,
      password_hash: passwordHash,
      is_verified: false,
    });

    const savedAuthAccount = await this.authRepo.save(authAccount);

    return {
      message: 'Cuenta de autenticación creada correctamente',
      data: {
        user_id: savedUser.id,
        full_name: savedUser.full_name,
        role: savedUser.role,
        email: savedAuthAccount.email,
        provider: savedAuthAccount.provider,
        is_verified: savedAuthAccount.is_verified,
        created_at: savedAuthAccount.created_at,
      },
    };
  }

  async login(loginDto: LoginDto) {
    let { email, password } = loginDto;

    email = email.trim().toLowerCase();

    const authAccount = await this.authRepo.findOne({
      where: { email },
    });

    if (!authAccount) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await argon2.verify(
      authAccount.password_hash,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    authAccount.last_login_at = new Date();
    await this.authRepo.save(authAccount);

    return {
      message: 'Inicio de sesión exitoso',
      data: {
        user_id: authAccount.user_id,
        email: authAccount.email,
        provider: authAccount.provider,
      },
    };
  }
}
