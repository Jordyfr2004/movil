import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';
import { Roles} from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { PickupTokenDto } from './dto/pickup-token.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.MANAGER)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() dto: CreateReservationDto, @Req() req: any) {
    return this.reservationsService.create(dto, req.user.user_id);
  }


  @Post('pickup/verify')
  @Roles(UserRole.MANAGER)
  verifyPickupQr(
    @Body() pickupTokenDto: PickupTokenDto,
    @Req() req: any,
  ) {
    return this.reservationsService.verifyPickupQr(
      pickupTokenDto.pickup_token,
      req.user.user_id,
    );
  }

  @Post('pickup/confirm')
  @Roles(UserRole.MANAGER)
  confirmPickupDelivery(
    @Body() pickupTokenDto: PickupTokenDto,
    @Req() req: any,
  ) {
    return this.reservationsService.confirmPickupDelivery(
      pickupTokenDto.pickup_token,
      req.user.user_id,
    );
  }

  @Post(':id/pickup-qr')
  generatePickupQr(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.reservationsService.generatePickupQr(
      id,
      req.user.user_id,
    );
  }

  @Get('manager')
  @Roles(UserRole.MANAGER)
  findForManager(@Req() req: any) {
    return this.reservationsService.findRestaurantReservations(
      req.user.user_id,
    );
  }

  @Get('my')
  findMine(@Req() req: any) {
    return this.reservationsService.findMyReservations(req.user.user_id);
  }

  @Get(':id/receipt')
  getDeliveryReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.reservationsService.getDeliveryReceipt(
      id,
      req.user.user_id,
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.reservationsService.cancel(id, req.user.user_id);
  }
}
