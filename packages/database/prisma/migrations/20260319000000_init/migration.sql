-- CreateTable
CREATE TABLE IF NOT EXISTS "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'individual',
    "document" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customer_contacts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customer_addresses" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customer_portal_tokens" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "customer_portal_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "services" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_price" DECIMAL(10,2) NOT NULL,
    "estimated_duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "quotations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "quotation_items" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "quotation_id" TEXT,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "scheduled_for" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "total_amount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_timeline" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_checklists" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "attachments" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "receivables" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "service_order_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "receivable_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "registered_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "suppliers" (
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
CREATE TABLE IF NOT EXISTS "payables" (
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
CREATE TABLE IF NOT EXISTS "payable_payments" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_id_email_key" ON "users"("tenant_id", "email");
CREATE INDEX IF NOT EXISTS "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX IF NOT EXISTS "users_tenant_id_email_idx" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "customers_tenant_id_document_key" ON "customers"("tenant_id", "document");
CREATE INDEX IF NOT EXISTS "customers_tenant_id_idx" ON "customers"("tenant_id");
CREATE INDEX IF NOT EXISTS "customers_tenant_id_name_idx" ON "customers"("tenant_id", "name");
CREATE INDEX IF NOT EXISTS "customers_tenant_id_status_idx" ON "customers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_contacts_customer_id_idx" ON "customer_contacts"("customer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "customer_portal_tokens_token_key" ON "customer_portal_tokens"("token");
CREATE INDEX IF NOT EXISTS "customer_portal_tokens_tenant_id_idx" ON "customer_portal_tokens"("tenant_id");
CREATE INDEX IF NOT EXISTS "customer_portal_tokens_token_idx" ON "customer_portal_tokens"("token");
CREATE INDEX IF NOT EXISTS "customer_portal_tokens_customer_id_idx" ON "customer_portal_tokens"("customer_id");
CREATE INDEX IF NOT EXISTS "customer_portal_tokens_expires_at_idx" ON "customer_portal_tokens"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "services_tenant_id_idx" ON "services"("tenant_id");
CREATE INDEX IF NOT EXISTS "services_tenant_id_status_idx" ON "services"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "quotations_tenant_id_number_key" ON "quotations"("tenant_id", "number");
CREATE INDEX IF NOT EXISTS "quotations_tenant_id_idx" ON "quotations"("tenant_id");
CREATE INDEX IF NOT EXISTS "quotations_tenant_id_status_idx" ON "quotations"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "quotations_tenant_id_customer_id_idx" ON "quotations"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "quotations_tenant_id_created_at_idx" ON "quotations"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "service_orders_quotation_id_key" ON "service_orders"("quotation_id");
CREATE UNIQUE INDEX IF NOT EXISTS "service_orders_tenant_id_number_key" ON "service_orders"("tenant_id", "number");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_idx" ON "service_orders"("tenant_id");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_status_idx" ON "service_orders"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_customer_id_idx" ON "service_orders"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_assigned_to_idx" ON "service_orders"("tenant_id", "assigned_to");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_scheduled_for_idx" ON "service_orders"("tenant_id", "scheduled_for");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_created_at_idx" ON "service_orders"("tenant_id", "created_at");
CREATE INDEX IF NOT EXISTS "service_orders_tenant_id_completed_at_idx" ON "service_orders"("tenant_id", "completed_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_items_service_order_id_idx" ON "order_items"("service_order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_timeline_service_order_id_idx" ON "order_timeline"("service_order_id");
CREATE INDEX IF NOT EXISTS "order_timeline_service_order_id_created_at_idx" ON "order_timeline"("service_order_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_checklists_service_order_id_idx" ON "order_checklists"("service_order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "attachments_service_order_id_idx" ON "attachments"("service_order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "receivables_tenant_id_idx" ON "receivables"("tenant_id");
CREATE INDEX IF NOT EXISTS "receivables_tenant_id_status_idx" ON "receivables"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "receivables_tenant_id_due_date_idx" ON "receivables"("tenant_id", "due_date");
CREATE INDEX IF NOT EXISTS "receivables_tenant_id_customer_id_idx" ON "receivables"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payments_receivable_id_idx" ON "payments"("receivable_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_tenant_id_document_key" ON "suppliers"("tenant_id", "document");
CREATE INDEX IF NOT EXISTS "suppliers_tenant_id_idx" ON "suppliers"("tenant_id");
CREATE INDEX IF NOT EXISTS "suppliers_tenant_id_name_idx" ON "suppliers"("tenant_id", "name");
CREATE INDEX IF NOT EXISTS "suppliers_tenant_id_status_idx" ON "suppliers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payables_tenant_id_idx" ON "payables"("tenant_id");
CREATE INDEX IF NOT EXISTS "payables_tenant_id_status_idx" ON "payables"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "payables_tenant_id_due_date_idx" ON "payables"("tenant_id", "due_date");
CREATE INDEX IF NOT EXISTS "payables_tenant_id_supplier_id_idx" ON "payables"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payable_payments_payable_id_idx" ON "payable_payments"("payable_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_entity_entity_id_idx" ON "audit_logs"("tenant_id", "entity", "entity_id");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_user_id_idx" ON "audit_logs"("tenant_id", "user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_action_idx" ON "audit_logs"("tenant_id", "action");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT IF NOT EXISTS "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT IF NOT EXISTS "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT IF NOT EXISTS "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_portal_tokens" ADD CONSTRAINT IF NOT EXISTS "customer_portal_tokens_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT IF NOT EXISTS "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT IF NOT EXISTS "quotations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT IF NOT EXISTS "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT IF NOT EXISTS "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT IF NOT EXISTS "quotation_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT IF NOT EXISTS "service_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT IF NOT EXISTS "service_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT IF NOT EXISTS "service_orders_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT IF NOT EXISTS "service_orders_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT IF NOT EXISTS "order_items_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT IF NOT EXISTS "order_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_timeline" ADD CONSTRAINT IF NOT EXISTS "order_timeline_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_checklists" ADD CONSTRAINT IF NOT EXISTS "order_checklists_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT IF NOT EXISTS "attachments_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT IF NOT EXISTS "receivables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT IF NOT EXISTS "receivables_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT IF NOT EXISTS "receivables_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT IF NOT EXISTS "payments_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "receivables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT IF NOT EXISTS "payments_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT IF NOT EXISTS "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT IF NOT EXISTS "payables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT IF NOT EXISTS "payables_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_payments" ADD CONSTRAINT IF NOT EXISTS "payable_payments_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_payments" ADD CONSTRAINT IF NOT EXISTS "payable_payments_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT IF NOT EXISTS "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
