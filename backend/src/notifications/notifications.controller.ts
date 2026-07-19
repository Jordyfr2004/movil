import {Controller,Get,Param,ParseUUIDPipe,Patch,Req,UseGuards,Body, Post} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';



@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('device-token')
  registerDeviceToken(
    @Body()
    dto: RegisterDeviceTokenDto,

    @Req()
    req: any,
  ) {
    return this.notificationsService
      .registerDeviceToken(
        req.user.user_id,
        dto.token,
      );
  }

  @Get('my')
  findMine(@Req() req: any) {
    return this.notificationsService.findMine(
      req.user.user_id,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.notificationsService.markAsRead(
      id,
      req.user.user_id,
    );
  }
}