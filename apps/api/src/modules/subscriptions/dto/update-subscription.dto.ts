import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  planId?: string;

  @IsEnum(['monthly', 'yearly'])
  @IsOptional()
  billingCycle?: 'monthly' | 'yearly';
}

export class CancelSubscriptionDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  feedback?: string;
}
