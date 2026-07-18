import {IsHexadecimal,IsString,Length,} from 'class-validator';

export class PickupTokenDto {
  @IsString()
  @Length(64, 64)
  @IsHexadecimal()
  pickup_token!: string;
}