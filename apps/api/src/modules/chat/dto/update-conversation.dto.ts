import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum ConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;
}
