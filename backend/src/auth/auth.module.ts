import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAccount } from './entities/auth-account.entity';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

@Module({
  imports: [ TypeOrmModule.forFeature([AuthAccount, User, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<StringValue>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
