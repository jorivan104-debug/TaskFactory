-- CreateTable
CREATE TABLE "work_sites" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "work_site_id" UUID,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "work_site_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "abbreviation" VARCHAR(32) NOT NULL,
    "logo_url" TEXT,
    "next_reference_sequence" BIGINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "silhouette_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "sort_order" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "silhouette_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "silhouettes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "silhouette_category_id" UUID NOT NULL,
    "gender" VARCHAR(32),
    "description" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "silhouettes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pantone_colors" (
    "id" UUID NOT NULL,
    "pantone_system" VARCHAR(16) NOT NULL,
    "pantone_code" VARCHAR(32) NOT NULL,
    "pantone_label" VARCHAR(128),
    "name" VARCHAR(255),
    "hex_approx" CHAR(7),
    "rgb_r" SMALLINT,
    "rgb_g" SMALLINT,
    "rgb_b" SMALLINT,
    "lab_l" DECIMAL(6,3),
    "lab_a" DECIMAL(6,3),
    "lab_b" DECIMAL(6,3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "pantone_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "sort_order" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units_of_measure" (
    "id" UUID NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "sort_order" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supply_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "tax_id" VARCHAR(64),
    "country" VARCHAR(64),
    "city" VARCHAR(128),
    "address" TEXT,
    "phone" VARCHAR(64),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "contact_person" VARCHAR(255),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "supply_type_id" UUID NOT NULL,
    "seller_user_id" UUID NOT NULL,
    "default_supplier_id" UUID,
    "unit_of_measure_id" UUID NOT NULL,
    "stock_on_hand" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "stock_on_way" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "purchase_unit_price" DECIMAL(18,4),
    "sku" VARCHAR(64),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supplies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_purchase_orders" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "supplier_id" UUID NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "ordered_at" TIMESTAMPTZ,
    "expected_at" DATE,
    "default_warehouse_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supply_purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_purchase_order_items" (
    "id" UUID NOT NULL,
    "supply_purchase_order_id" UUID NOT NULL,
    "supply_id" UUID NOT NULL,
    "quantity_ordered" DECIMAL(18,4) NOT NULL,
    "quantity_received" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unit_of_measure_id" UUID NOT NULL,
    "unit_price" DECIMAL(18,4),
    "line_total" DECIMAL(18,4),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supply_purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_purchase_receipts" (
    "id" UUID NOT NULL,
    "supply_purchase_order_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "received_at" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supply_purchase_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_purchase_receipt_items" (
    "id" UUID NOT NULL,
    "supply_purchase_receipt_id" UUID NOT NULL,
    "supply_purchase_order_item_id" UUID NOT NULL,
    "quantity_received" DECIMAL(18,4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supply_purchase_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "invoice_number" VARCHAR(64) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "due_date" DATE,
    "currency" CHAR(3) NOT NULL,
    "subtotal" DECIMAL(18,4) NOT NULL,
    "tax_amount" DECIMAL(18,4),
    "total" DECIMAL(18,4) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoice_lines" (
    "id" UUID NOT NULL,
    "supplier_invoice_id" UUID NOT NULL,
    "supply_purchase_order_item_id" UUID,
    "description" VARCHAR(255),
    "quantity" DECIMAL(18,4),
    "unit_price" DECIMAL(18,4),
    "line_total" DECIMAL(18,4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supplier_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payments" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "paid_at" TIMESTAMPTZ NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "payment_method" VARCHAR(32),
    "reference" VARCHAR(128),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payment_allocations" (
    "id" UUID NOT NULL,
    "supplier_payment_id" UUID NOT NULL,
    "supplier_invoice_id" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "supplier_payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developments" (
    "id" UUID NOT NULL,
    "lexi_external_id" VARCHAR(128),
    "title" VARCHAR(255),
    "image_url" TEXT,
    "attributes_json" JSONB,
    "status" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "developments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "work_site_id" UUID NOT NULL,
    "development_id" UUID,
    "production_type" VARCHAR(32) NOT NULL,
    "pattern_supplier_id" UUID,
    "patterning_days" INTEGER,
    "design_instructions" TEXT,
    "design_instructions_updated_at" TIMESTAMPTZ,
    "design_attachments_json" JSONB,
    "status" VARCHAR(32) NOT NULL,
    "closed_at" TIMESTAMPTZ,
    "closed_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garment_references" (
    "id" UUID NOT NULL,
    "production_order_id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "silhouette_id" UUID NOT NULL,
    "fabric_supply_id" UUID NOT NULL,
    "pantone_color_id" UUID,
    "garment_image_url_1" TEXT,
    "garment_image_url_2" TEXT,
    "garment_image_url_3" TEXT,
    "cut_garments_qty" INTEGER,
    "programmed_garments_qty" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "garment_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_order_size_curve_items" (
    "id" UUID NOT NULL,
    "production_order_id" UUID NOT NULL,
    "size_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "sort_order" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "production_order_size_curve_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" UUID NOT NULL,
    "production_order_id" UUID NOT NULL,
    "work_site_id" UUID,
    "code" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255),
    "status" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_pantone_colors" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "pantone_color_id" UUID NOT NULL,
    "usage_label" VARCHAR(64),
    "sort_order" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_pantone_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_logs" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "entry_type" VARCHAR(32) NOT NULL,
    "summary" VARCHAR(255),
    "body" TEXT,
    "metadata_json" JSONB,
    "changes_json" JSONB,
    "performed_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(64),
    "product_type" VARCHAR(32) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stock_lots" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "lot_code" VARCHAR(64),
    "serial_code" VARCHAR(128),
    "quantity_on_hand" DECIMAL(18,4) NOT NULL,
    "unit_of_measure_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "inventory_stock_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "lot_code" VARCHAR(64),
    "serial_code" VARCHAR(128),
    "movement_type" VARCHAR(32) NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_of_measure_id" UUID NOT NULL,
    "reference_type" VARCHAR(64),
    "reference_id" UUID,
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_sync_requests" (
    "id" UUID NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "accounting_sync_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(64) NOT NULL,
    "entity_type" VARCHAR(64) NOT NULL,
    "entity_id" UUID,
    "changes_json" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_orders" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "requested_by" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "approved_at" TIMESTAMPTZ,
    "approved_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "internal_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_order_items" (
    "id" UUID NOT NULL,
    "internal_order_id" UUID NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "internal_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" VARCHAR(255) NOT NULL,
    "document_id" VARCHAR(64),
    "phone" VARCHAR(64),
    "position" VARCHAR(128),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "clock_in" TIMESTAMPTZ NOT NULL,
    "clock_out" TIMESTAMPTZ,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignments" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "description" VARCHAR(255),
    "status" VARCHAR(32) NOT NULL,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "third_party_services" (
    "id" UUID NOT NULL,
    "supplier_id" UUID,
    "service_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(32) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "cost" DECIMAL(18,4),
    "currency" CHAR(3),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "third_party_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "origin" VARCHAR(255),
    "destination" VARCHAR(255),
    "status" VARCHAR(32) NOT NULL,
    "shipped_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "carrier" VARCHAR(128),
    "tracking_number" VARCHAR(128),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_items" (
    "id" UUID NOT NULL,
    "shipment_id" UUID NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_sites_code_key" ON "work_sites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_work_site_id_key" ON "user_roles"("user_id", "role_id", "work_site_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_abbreviation_key" ON "brands"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "silhouette_categories_name_key" ON "silhouette_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pantone_colors_pantone_system_pantone_code_key" ON "pantone_colors"("pantone_system", "pantone_code");

-- CreateIndex
CREATE UNIQUE INDEX "sizes_name_key" ON "sizes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_code_key" ON "units_of_measure"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supply_types_code_key" ON "supply_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supply_purchase_orders_code_key" ON "supply_purchase_orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supply_purchase_order_items_supply_purchase_order_id_supply_key" ON "supply_purchase_order_items"("supply_purchase_order_id", "supply_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_supplier_id_invoice_number_key" ON "supplier_invoices"("supplier_id", "invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "developments_lexi_external_id_key" ON "developments"("lexi_external_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_code_key" ON "production_orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "garment_references_production_order_id_key" ON "garment_references"("production_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_order_size_curve_items_production_order_id_size__key" ON "production_order_size_curve_items"("production_order_id", "size_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_pantone_colors_work_order_id_pantone_color_id_us_key" ON "work_order_pantone_colors"("work_order_id", "pantone_color_id", "usage_label");

-- CreateIndex
CREATE INDEX "work_order_logs_work_order_id_performed_at_idx" ON "work_order_logs"("work_order_id", "performed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "internal_orders_code_key" ON "internal_orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_code_key" ON "shipments"("code");

-- AddForeignKey
ALTER TABLE "work_sites" ADD CONSTRAINT "work_sites_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_work_site_id_fkey" FOREIGN KEY ("work_site_id") REFERENCES "work_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_work_site_id_fkey" FOREIGN KEY ("work_site_id") REFERENCES "work_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "silhouette_categories" ADD CONSTRAINT "silhouette_categories_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "silhouettes" ADD CONSTRAINT "silhouettes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "silhouettes" ADD CONSTRAINT "silhouettes_silhouette_category_id_fkey" FOREIGN KEY ("silhouette_category_id") REFERENCES "silhouette_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pantone_colors" ADD CONSTRAINT "pantone_colors_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sizes" ADD CONSTRAINT "sizes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units_of_measure" ADD CONSTRAINT "units_of_measure_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_types" ADD CONSTRAINT "supply_types_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "supplies_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "supplies_seller_user_id_fkey" FOREIGN KEY ("seller_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "supplies_supply_type_id_fkey" FOREIGN KEY ("supply_type_id") REFERENCES "supply_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "supplies_default_supplier_id_fkey" FOREIGN KEY ("default_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "supplies_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_orders" ADD CONSTRAINT "supply_purchase_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_orders" ADD CONSTRAINT "supply_purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_orders" ADD CONSTRAINT "supply_purchase_orders_default_warehouse_id_fkey" FOREIGN KEY ("default_warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_order_items" ADD CONSTRAINT "supply_purchase_order_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_order_items" ADD CONSTRAINT "supply_purchase_order_items_supply_purchase_order_id_fkey" FOREIGN KEY ("supply_purchase_order_id") REFERENCES "supply_purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_order_items" ADD CONSTRAINT "supply_purchase_order_items_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "supplies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_order_items" ADD CONSTRAINT "supply_purchase_order_items_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_receipts" ADD CONSTRAINT "supply_purchase_receipts_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_receipts" ADD CONSTRAINT "supply_purchase_receipts_supply_purchase_order_id_fkey" FOREIGN KEY ("supply_purchase_order_id") REFERENCES "supply_purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_receipts" ADD CONSTRAINT "supply_purchase_receipts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_receipt_items" ADD CONSTRAINT "supply_purchase_receipt_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_receipt_items" ADD CONSTRAINT "supply_purchase_receipt_items_supply_purchase_receipt_id_fkey" FOREIGN KEY ("supply_purchase_receipt_id") REFERENCES "supply_purchase_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_purchase_receipt_items" ADD CONSTRAINT "supply_purchase_receipt_items_supply_purchase_order_item_i_fkey" FOREIGN KEY ("supply_purchase_order_item_id") REFERENCES "supply_purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_supplier_invoice_id_fkey" FOREIGN KEY ("supplier_invoice_id") REFERENCES "supplier_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_supply_purchase_order_item_id_fkey" FOREIGN KEY ("supply_purchase_order_item_id") REFERENCES "supply_purchase_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "supplier_payment_allocations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "supplier_payment_allocations_supplier_payment_id_fkey" FOREIGN KEY ("supplier_payment_id") REFERENCES "supplier_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "supplier_payment_allocations_supplier_invoice_id_fkey" FOREIGN KEY ("supplier_invoice_id") REFERENCES "supplier_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developments" ADD CONSTRAINT "developments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_work_site_id_fkey" FOREIGN KEY ("work_site_id") REFERENCES "work_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_development_id_fkey" FOREIGN KEY ("development_id") REFERENCES "developments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_pattern_supplier_id_fkey" FOREIGN KEY ("pattern_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_silhouette_id_fkey" FOREIGN KEY ("silhouette_id") REFERENCES "silhouettes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_fabric_supply_id_fkey" FOREIGN KEY ("fabric_supply_id") REFERENCES "supplies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_pantone_color_id_fkey" FOREIGN KEY ("pantone_color_id") REFERENCES "pantone_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_order_size_curve_items" ADD CONSTRAINT "production_order_size_curve_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_order_size_curve_items" ADD CONSTRAINT "production_order_size_curve_items_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_order_size_curve_items" ADD CONSTRAINT "production_order_size_curve_items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_work_site_id_fkey" FOREIGN KEY ("work_site_id") REFERENCES "work_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_pantone_colors" ADD CONSTRAINT "work_order_pantone_colors_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_pantone_colors" ADD CONSTRAINT "work_order_pantone_colors_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_pantone_colors" ADD CONSTRAINT "work_order_pantone_colors_pantone_color_id_fkey" FOREIGN KEY ("pantone_color_id") REFERENCES "pantone_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_logs" ADD CONSTRAINT "work_order_logs_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_logs" ADD CONSTRAINT "work_order_logs_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_lots" ADD CONSTRAINT "inventory_stock_lots_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_lots" ADD CONSTRAINT "inventory_stock_lots_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_lots" ADD CONSTRAINT "inventory_stock_lots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_lots" ADD CONSTRAINT "inventory_stock_lots_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_sync_requests" ADD CONSTRAINT "accounting_sync_requests_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_orders" ADD CONSTRAINT "internal_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_orders" ADD CONSTRAINT "internal_orders_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_order_items" ADD CONSTRAINT "internal_order_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_order_items" ADD CONSTRAINT "internal_order_items_internal_order_id_fkey" FOREIGN KEY ("internal_order_id") REFERENCES "internal_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "third_party_services" ADD CONSTRAINT "third_party_services_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
