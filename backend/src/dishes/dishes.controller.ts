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
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDishDto: CreateDishDto, @Req() req: any) {
    return this.dishesService.create(createDishDto, req.user.user_id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.dishesService.findAllByManager(req.user.user_id);
  }

  @Get('restaurant/:restaurantId')
  findPublicByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.dishesService.findPublicByRestaurant(restaurantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.dishesService.findOneForManager(id, req.user.user_id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
    @Req() req: any,
  ) {
    return this.dishesService.update(id, updateDishDto, req.user.user_id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.dishesService.remove(id, req.user.user_id);
  }
}
