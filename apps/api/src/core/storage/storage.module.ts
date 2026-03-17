import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

/**
 * Módulo de Storage (S3 ou Local)
 *
 * Global para ser usado em todos os módulos sem import explícito
 * Suporta S3 (produção) ou filesystem local (fallback)
 */
@Global()
@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
