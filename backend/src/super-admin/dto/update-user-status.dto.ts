import { IsEnum, IsUUID } from 'class-validator';
import { UserStatus } from '../../users/entities/user.entity';

export class UpdateUserStatusDto {
  @IsUUID()
  user_id!: string;

  @IsEnum(UserStatus)
  status!: UserStatus;
}