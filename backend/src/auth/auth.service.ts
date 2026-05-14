import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { AuthAccount, AuthProvider } from './entities/auth-account.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthAccount)
    private readonly authRepo: Repository<AuthAccount>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,

    private readonly jwtService: JwtService,
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
      role: UserRole.STUDENT,
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

    const payload = {
      sub: authAccount.user_id,
      email: authAccount.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await argon2.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = this.refreshTokenRepo.create({
      user_id: authAccount.user_id,
      token_hash: refreshTokenHash,
      is_revoked: false,
      expires_at: expiresAt,
    });

    await this.refreshTokenRepo.save(refreshTokenEntity);

    return {
      message: 'Inicio de sesión exitoso',
      data: {
        user_id: authAccount.user_id,
        email: authAccount.email,
        provider: authAccount.provider,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  async logout(logoutDto: LogoutDto) {
    const { refresh_token } = logoutDto;

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(refresh_token);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const activeTokens = await this.refreshTokenRepo.find({
      where: {
        user_id: payload.sub,
        is_revoked: false,
      },
    });

    for (const tokenRecord of activeTokens) {
      if (tokenRecord.expires_at < new Date()) {
        tokenRecord.is_revoked = true;
        await this.refreshTokenRepo.save(tokenRecord);
        continue;
      }

      const isMatch = await argon2.verify(
        tokenRecord.token_hash,
        refresh_token,
      );

      if (isMatch) {
        tokenRecord.is_revoked = true;
        await this.refreshTokenRepo.save(tokenRecord);

        return {
          message: 'Sesión cerrada correctamente',
        };
      }
    }

    throw new NotFoundException('Token de sesión no encontrado');
  }


  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(refresh_token);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const activeTokens = await this.refreshTokenRepo.find({
      where: {
        user_id: payload.sub,
        is_revoked: false,
      },
    });

    for (const tokenRecord of activeTokens) {
      const isMatch = await argon2.verify(
        tokenRecord.token_hash,
        refresh_token,
      );

      if (!isMatch) {
        continue;
      }

      if (tokenRecord.expires_at < new Date()) {
        tokenRecord.is_revoked = true;
        await this.refreshTokenRepo.save(tokenRecord);

        throw new UnauthorizedException('Refresh token expirado');
      }

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      return {
        message: 'Access token renovado correctamente',
        data: {
          access_token: accessToken,
        },
      };
    }

    throw new UnauthorizedException('Refresh token no válido');
  }
}
