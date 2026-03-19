-- CreateTable
CREATE TABLE "customer_portal_tokens" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "customer_portal_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_portal_tokens_token_key" ON "customer_portal_tokens"("token");

-- CreateIndex
CREATE INDEX "customer_portal_tokens_tenant_id_idx" ON "customer_portal_tokens"("tenant_id");

-- CreateIndex
CREATE INDEX "customer_portal_tokens_token_idx" ON "customer_portal_tokens"("token");

-- CreateIndex
CREATE INDEX "customer_portal_tokens_customer_id_idx" ON "customer_portal_tokens"("customer_id");

-- CreateIndex
CREATE INDEX "customer_portal_tokens_expires_at_idx" ON "customer_portal_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "customer_portal_tokens" ADD CONSTRAINT "customer_portal_tokens_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
