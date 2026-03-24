-- AlterTable
ALTER TABLE "quotations" ADD COLUMN "signed_at" TIMESTAMP(3),
ADD COLUMN "signed_by" TEXT,
ADD COLUMN "signed_document_url" TEXT,
ADD COLUMN "signature_hash" TEXT;

-- AlterTable
ALTER TABLE "service_orders" ADD COLUMN "signed_at" TIMESTAMP(3),
ADD COLUMN "signed_by" TEXT,
ADD COLUMN "signed_document_url" TEXT,
ADD COLUMN "signature_hash" TEXT;

-- CreateIndex
CREATE INDEX "quotations_signed_by_idx" ON "quotations"("signed_by");

-- CreateIndex
CREATE INDEX "service_orders_signed_by_idx" ON "service_orders"("signed_by");

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
