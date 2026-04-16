import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { UserStatus } from "../entities/user.entity";

export class CreateUserDto {

    @IsUUID()
    @IsNotEmpty()
    role_id: string;

    @IsString()
    @IsNotEmpty()
    full_name: string;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

}
