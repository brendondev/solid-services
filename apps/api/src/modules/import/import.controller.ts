import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { ImportService } from './import.service';
import {
  AnalyzeImportDto,
  ImportPreviewDto,
  ImportResultDto,
} from './dto/analyze-import.dto';
import { ExecuteImportDto } from './dto/execute-import.dto';

@ApiTags('Import')
@ApiBearerAuth()
@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          enum: ['customers', 'services', 'suppliers', 'products'],
        },
      },
    },
  })
  async analyzeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AnalyzeImportDto,
  ): Promise<ImportPreviewDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    // Validar tamanho (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo: 10 MB');
    }

    // Validar tipo
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Use .xlsx, .xls ou .csv',
      );
    }

    return this.importService.analyzeFile(file, dto.entityType);
  }

  @Post('execute')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          enum: ['customers', 'services', 'suppliers', 'products'],
        },
      },
    },
  })
  async executeImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ExecuteImportDto,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    // Validar tamanho (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo: 10 MB');
    }

    // Validar tipo
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Use .xlsx, .xls ou .csv',
      );
    }

    return this.importService.executeImport(file, dto.entityType, tenantId);
  }
}
