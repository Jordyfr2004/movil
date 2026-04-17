import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAccount } from './entities/auth-account.entity';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ TypeOrmModule.forFeature([AuthAccount, User]),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with your own secret key
      signOptions: { expiresIn: '1d' }, // Token expiration time
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
