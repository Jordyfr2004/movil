import { IsEmail, IsNotEmpty, IsString, IsUUID, Min, MinLength } from "class-validator";

export class RegisterAuthDto {

    @IsString()
    @IsNotEmpty()
    full_name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

}