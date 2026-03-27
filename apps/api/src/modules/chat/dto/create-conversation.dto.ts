import { IsString, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  title?: string;
}
