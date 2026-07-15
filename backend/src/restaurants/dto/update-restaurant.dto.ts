import {IsNotEmpty,IsOptional,IsString,} from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}