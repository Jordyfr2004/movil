import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';




@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.MANAGER)
  createPaymentIntent(@Body() dto: CreatePaymentIntentDto, @Req() req: any,){
    return this.paymentsService.createPaymentIntent(
      dto.reservation_id,
      req.user.user_id,
    )
  }

  @Post('webhook')
  handleStripeWebhook(@Req() req: RawBodyRequest<Request>,@Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleStripeWebhook(req.rawBody!, signature)
  }

}
