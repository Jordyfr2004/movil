import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthAccount } from 'src/auth/entities/auth-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthAccount]),
  AuthModule,
],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
