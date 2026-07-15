import {IsNotEmpty,IsString,} from 'class-validator';

export class PickupTokenDto {
  @IsString()
  @IsNotEmpty()
  pickup_token!: string;
}