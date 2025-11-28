import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CheckoutPlanType } from '../../services/checkout.service';

export class CheckoutFriendDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}

export class CheckoutIntentDto {
  @IsString()
  planId!: string;

  @IsIn(['subscription', 'location'])
  planType!: CheckoutPlanType;

  @IsIn(['me', 'friend'])
  target!: 'me' | 'friend';

  @ValidateNested()
  @Type(() => CheckoutFriendDto)
  @IsOptional()
  friend?: CheckoutFriendDto;

  @IsIn(['card', 'fedapay', 'mobile_money'])
  paymentMethod!: 'card' | 'fedapay' | 'mobile_money';
}

export class PaymentResultDto {
  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  providerRef?: string;
}

export class CheckoutConfirmDto {
  @IsString()
  intentId!: string;

  @ValidateNested()
  @Type(() => PaymentResultDto)
  paymentResult!: PaymentResultDto;
}
