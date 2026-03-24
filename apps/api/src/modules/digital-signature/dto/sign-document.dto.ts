import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SignatureType } from '../interfaces/signature.interface';

/**
 * DTO para assinatura de documentos
 */
export class SignDocumentDto {
  @ApiProperty({
    description: 'Tipo do documento (quotation ou order)',
    example: 'quotation',
    enum: ['quotation', 'order'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['quotation', 'order'])
  documentType: 'quotation' | 'order';

  @ApiProperty({
    description: 'ID do documento a ser assinado',
    example: 'uuid-do-documento',
  })
  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({
    description: 'Tipo de assinatura',
    example: SignatureType.GOVBR,
    enum: SignatureType,
    required: false,
  })
  @IsEnum(SignatureType)
  @IsOptional()
  signatureType?: SignatureType;

  @ApiProperty({
    description: 'Access token do Gov.br (apenas para signatureType=govbr)',
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    required: false,
  })
  @IsString()
  @IsOptional()
  govbrAccessToken?: string;

  @ApiProperty({
    description: 'Imagem da assinatura manuscrita em Base64 (data URL)',
    example: 'data:image/png;base64,iVBORw0KG...',
    required: false,
  })
  @IsString()
  @IsOptional()
  signatureImage?: string;
}
