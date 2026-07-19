import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token!: string;
}