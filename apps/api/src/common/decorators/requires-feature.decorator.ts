import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para exigir que uma feature esteja habilitada no plano
 *
 * @param feature - Nome da feature (ex: 'nfe', 'whatsapp', 'api')
 *
 * @example
 * ```typescript
 * @Post('nfe')
 * @RequiresFeature('nfe')
 * async emitirNFe() {
 *   // Só executa se o plano tiver a feature "nfe"
 * }
 * ```
 */
export const RequiresFeature = (feature: string) =>
  SetMetadata('requiredFeature', feature);
