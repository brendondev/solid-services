import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'SOLID SERVICE LTDA' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Solid Service' })
  @IsOptional()
  @IsString()
  tradingName?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-00' })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({ example: 'contato@solidservice.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 3456-7890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://solidservice.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  // Endereço
  @ApiPropertyOptional({ example: 'Av. Paulista' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '1000' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: 'Sala 100' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({ example: 'Bela Vista' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '01310-100' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  // Dados fiscais
  @ApiPropertyOptional({ example: '123.456.789.012' })
  @IsOptional()
  @IsString()
  stateRegistration?: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsOptional()
  @IsString()
  municipalRegistration?: string;
}
