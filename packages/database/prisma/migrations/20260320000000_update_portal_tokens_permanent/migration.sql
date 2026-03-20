-- AlterTable: Modificar CustomerPortalToken para tokens permanentes
-- Remove expiresAt, adiciona isValidated, validatedAt, revokedAt

-- 1. Adicionar novas colunas
ALTER TABLE "customer_portal_tokens"
  ADD COLUMN "is_validated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "validated_at" TIMESTAMP(3),
  ADD COLUMN "revoked_at" TIMESTAMP(3);

-- 2. Remover coluna expiresAt (não mais necessária)
ALTER TABLE "customer_portal_tokens"
  DROP COLUMN "expires_at";

-- 3. Atualizar índices
DROP INDEX IF EXISTS "customer_portal_tokens_expires_at_idx";
CREATE INDEX "customer_portal_tokens_is_validated_idx" ON "customer_portal_tokens"("is_validated");

-- 4. Marcar tokens existentes como validados (se houver)
-- UPDATE "customer_portal_tokens" SET "is_validated" = true, "validated_at" = NOW() WHERE "last_used_at" IS NOT NULL;
