import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateReservationItemDto {
  @IsUUID()
  @IsNotEmpty()
  dish_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateReservationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReservationItemDto)
  items!: CreateReservationItemDto[];
}
