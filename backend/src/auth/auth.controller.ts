import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerAthDto: RegisterAuthDto) {
        return this.authService.register(registerAthDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
