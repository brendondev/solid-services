import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';

/**
 * Módulo de Storage (S3)
 *
 * Global para ser usado em todos os módulos sem import explícito
 */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
