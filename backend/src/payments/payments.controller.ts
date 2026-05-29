import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
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
