import {CanActivate,ExecutionContext,Injectable,UnauthorizedException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import {User,UserStatus,} from '../../users/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(
        'Token no proporcionado',
      );
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token inválido');
    }

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado',
      );
    }

    if (payload.token_type !== 'access') {
      throw new UnauthorizedException(
        'El token proporcionado no es un access token',
      );
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.userRepo.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    if (
      !user.is_active ||
      user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException(
        'La cuenta está inactiva o suspendida',
      );
    }

    if (payload.session_version !== user.session_version) {
      throw new UnauthorizedException(
        'La sesión fue cerrada o reemplazada',
      );
    }

    request.user = {
      user_id: user.id,
      email: payload.email,
      role: user.role,
    };

    return true;
  }
}