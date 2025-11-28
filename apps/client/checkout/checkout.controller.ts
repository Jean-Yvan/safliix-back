import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CheckoutPlanType, CheckoutService, CheckoutFriendDto, CheckoutIntentDto, CheckoutConfirmDto } from '@safliix-back/access';

type AuthenticatedRequest = Request & { user?: { sub?: string } };

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('intent')
  @UseGuards(AuthGuard('keycloak'))
  async createIntent(@Body() dto: CheckoutIntentDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    return this.checkoutService.createIntent({
      ...dto,
      userId: userId ?? 'anonymous',
    });
  }

  @Post('confirm')
  async confirm(@Body() dto: CheckoutConfirmDto) {
    const status =
      dto.paymentResult.status === 'paid' || dto.paymentResult.status === 'succeeded'
        ? 'paid'
        : dto.paymentResult.status;

    return this.checkoutService.confirmIntent(dto.intentId, status);
  }
}
