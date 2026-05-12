import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateDishDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  // precio como string (decimal en DB)
  @IsNumberString()
  @IsNotEmpty()
  price!: string;

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}