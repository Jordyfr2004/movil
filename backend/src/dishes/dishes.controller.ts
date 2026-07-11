import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';



@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createDishDto: CreateDishDto, @UploadedFile() image: any, @Req() req: any) {
    return this.dishesService.create(createDishDto, req.user.user_id, image);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  findAll(@Req() req: any) {
    return this.dishesService.findAllByManager(req.user.user_id);
  }

  @Get('restaurant/:restaurantId')
  findPublicByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.dishesService.findPublicByRestaurant(restaurantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.dishesService.findOneForManager(id, req.user.user_id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
    @Req() req: any,
  ) {
    return this.dishesService.update(id, updateDishDto, req.user.user_id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.dishesService.remove(id, req.user.user_id);
  }
}
