import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() dto: CreateReservationDto, @Req() req: any) {
    return this.reservationsService.create(dto, req.user.user_id);
  }

  @Get('my')
  findMine(@Req() req: any) {
    return this.reservationsService.findMyReservations(req.user.user_id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.reservationsService.cancel(id, req.user.user_id);
  }
}
