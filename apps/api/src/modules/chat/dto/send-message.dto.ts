import { IsString, IsEnum } from 'class-validator';

export enum SenderType {
  CUSTOMER = 'customer',
  EMPLOYEE = 'employee',
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsEnum(SenderType)
  senderType: SenderType;
}
