-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payables" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "category" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payable_payments" (
    "id" TEXT NOT NULL,
    "payable_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "registered_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payable_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_idx" ON "suppliers"("tenant_id");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_name_idx" ON "suppliers"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_status_idx" ON "suppliers"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenant_id_document_key" ON "suppliers"("tenant_id", "document");

-- CreateIndex
CREATE INDEX "payables_tenant_id_idx" ON "payables"("tenant_id");

-- CreateIndex
CREATE INDEX "payables_tenant_id_status_idx" ON "payables"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payables_tenant_id_due_date_idx" ON "payables"("tenant_id", "due_date");

-- CreateIndex
CREATE INDEX "payables_tenant_id_supplier_id_idx" ON "payables"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX "payable_payments_payable_id_idx" ON "payable_payments"("payable_id");

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_payments" ADD CONSTRAINT "payable_payments_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_payments" ADD CONSTRAINT "payable_payments_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
