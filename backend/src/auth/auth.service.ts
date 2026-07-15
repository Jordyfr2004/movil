import {ConflictException,Injectable,UnauthorizedException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { AuthAccount, AuthProvider } from './entities/auth-account.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SessionConnectionsService } from './session-connections.service';

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

    private readonly sessionConnectionsService:
    SessionConnectionsService,

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
      relations: {
        user: true,
      }
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

    const user = authAccount.user;

    if (!user.is_active || user.status !== UserStatus.ACTIVE ){
      throw new UnauthorizedException('La cuenta esta inactiva o suspendida');
    }

    authAccount.last_login_at = new Date();
    await this.authRepo.save(authAccount);

    await this.refreshTokenRepo.update(
      {
        user_id: user.id,
        is_revoked: false,
      }, 
      {
        is_revoked: true,
      },
    );

    user.session_version += 1;
    await this.userRepo.save(user);

    const accessPayload = {
      sub: user.id,
      email: authAccount.email,
      role: user.role,
      token_type: 'access',
      session_version: user.session_version,
    };

    const refreshPayload = {
      sub: user.id,
      email: authAccount.email,
      role: user.role,
      token_type: 'refresh',
      session_version: user.session_version,
    };

    const accessToken = await this.jwtService.signAsync(
      accessPayload,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      refreshPayload,
      {
        expiresIn: '7d',
      },
    );

    

    const refreshTokenHash = await argon2.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = this.refreshTokenRepo.create({
      user_id: user.id,
      token_hash: refreshTokenHash,
      is_revoked: false,
      expires_at: expiresAt,
    });

    await this.refreshTokenRepo.save(refreshTokenEntity);

    return {
      message: 'Inicio de sesión exitoso',
      data: {
        user_id: user.id,
        email: authAccount.email,
        provider: authAccount.provider,
        role: user.role,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  async logout(logoutDto: LogoutDto) {
    const { refresh_token } = logoutDto;

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(
        refresh_token,
      );
    } catch {
      throw new UnauthorizedException(
        'Refresh token inválido o expirado',
      );
    }

    if (payload.token_type !== 'refresh') {
      throw new UnauthorizedException(
        'El token proporcionado no es un refresh token',
      );
    }

    if (!payload.sub) {
      throw new UnauthorizedException(
        'Refresh token inválido',
      );
    }

    const activeTokens =
      await this.refreshTokenRepo.find({
        where: {
          user_id: payload.sub,
          is_revoked: false,
        },
      });

    for (const tokenRecord of activeTokens) {
      if (tokenRecord.expires_at < new Date()) {
        tokenRecord.is_revoked = true;

        await this.refreshTokenRepo.save(
          tokenRecord,
        );

        continue;
      }

      const isMatch = await argon2.verify(
        tokenRecord.token_hash,
        refresh_token,
      );

      if (!isMatch) {
        continue;
      }

      await this.refreshTokenRepo.update(
        {
          user_id: payload.sub,
          is_revoked: false,
        },
        {
          is_revoked: true,
        },
      );

      await this.userRepo.increment(
        {
          id: payload.sub,
        },
        'session_version',
        1,
      );

      this.sessionConnectionsService.disconnectUser(
        payload.sub,
      );

      return {
        message: 'Sesión cerrada correctamente',
      };
    }

    throw new UnauthorizedException(
      'Token inválido o expirado',
    );
  }


  async refreshToken(refreshTokenDto: RefreshTokenDto,) {
    const { refresh_token } = refreshTokenDto;

    let payload: any;

    try {
      payload =
        await this.jwtService.verifyAsync(
          refresh_token,
        );
    } catch {
      throw new UnauthorizedException(
        'Refresh token inválido o expirado',
      );
    }

    // Verifica que realmente sea un refresh token
    if (payload.token_type !== 'refresh') {
      throw new UnauthorizedException(
        'El token proporcionado no es un refresh token',
      );
    }

    if (!payload.sub) {
      throw new UnauthorizedException(
        'Refresh token inválido',
      );
    }

    const activeTokens =
      await this.refreshTokenRepo.find({
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
        await this.refreshTokenRepo.save(
          tokenRecord,
        );

        throw new UnauthorizedException(
          'Refresh token expirado',
        );
      }

      const user = await this.userRepo.findOne({
        where: {
          id: payload.sub,
        },
      });

      if (
        !user ||
        !user.is_active ||
        user.status !== UserStatus.ACTIVE
      ) {
        tokenRecord.is_revoked = true;
        await this.refreshTokenRepo.save(
          tokenRecord,
        );

        throw new UnauthorizedException(
          'Usuario no encontrado, inactivo o suspendido',
        );
      }

      // Comprueba que la sesión siga vigente
      if (
        payload.session_version !==
        user.session_version
      ) {
        tokenRecord.is_revoked = true;
        await this.refreshTokenRepo.save(
          tokenRecord,
        );

        throw new UnauthorizedException(
          'La sesión fue cerrada o reemplazada',
        );
      }

      // Invalida el refresh token utilizado
      tokenRecord.is_revoked = true;
      await this.refreshTokenRepo.save(
        tokenRecord,
      );

      const newAccessPayload = {
        sub: user.id,
        email: payload.email,
        role: user.role,
        token_type: 'access',
        session_version: user.session_version,
      };

      const newRefreshPayload = {
        sub: user.id,
        email: payload.email,
        role: user.role,
        token_type: 'refresh',
        session_version: user.session_version,
      };

      const newAccessToken =
        await this.jwtService.signAsync(
          newAccessPayload,
          {
            expiresIn: '15m',
          },
        );

      const newRefreshToken =
        await this.jwtService.signAsync(
          newRefreshPayload,
          {
            expiresIn: '7d',
          },
        );

      const newRefreshTokenHash =
        await argon2.hash(newRefreshToken);

      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + 7,
      );

      const newRefreshTokenEntity =
        this.refreshTokenRepo.create({
          user_id: user.id,
          token_hash: newRefreshTokenHash,
          is_revoked: false,
          expires_at: expiresAt,
        });

      await this.refreshTokenRepo.save(
        newRefreshTokenEntity,
      );

      return {
        message: 'Tokens renovados correctamente',
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      };
    }

    throw new UnauthorizedException(
      'Refresh token no válido',
    );
  }
}
