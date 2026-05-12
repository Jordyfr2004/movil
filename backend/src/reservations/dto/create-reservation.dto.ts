import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateReservationItemDto {
  @IsUUID()
  @IsNotEmpty()
  dish_id!: string;
}

export class CreateReservationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReservationItemDto)
  items!: CreateReservationItemDto[];
}
