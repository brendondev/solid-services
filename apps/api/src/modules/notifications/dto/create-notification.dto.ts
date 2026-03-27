import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
