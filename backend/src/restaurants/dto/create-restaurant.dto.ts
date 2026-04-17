import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRestaurantDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

}