-- Simplify production model: remove developments + production_orders,
-- promote work_orders as the main production entity with garment_references 1:1
-- and size curve directly on the work order.

-- ============================================================
-- 1. Add new columns to work_orders (from production_orders)
-- ============================================================

ALTER TABLE "work_orders" ADD COLUMN "production_type" VARCHAR(32);
ALTER TABLE "work_orders" ADD COLUMN "pattern_supplier_id" UUID;
ALTER TABLE "work_orders" ADD COLUMN "patterning_days" INT;
ALTER TABLE "work_orders" ADD COLUMN "design_instructions" TEXT;
ALTER TABLE "work_orders" ADD COLUMN "design_instructions_updated_at" TIMESTAMPTZ;
ALTER TABLE "work_orders" ADD COLUMN "design_attachments_json" JSONB;
ALTER TABLE "work_orders" ADD COLUMN "closed_at" TIMESTAMPTZ;
ALTER TABLE "work_orders" ADD COLUMN "closed_by_user_id" UUID;

-- Make work_site_id NOT NULL (was optional, now required like it was on production_orders)
-- First ensure no NULLs exist, then alter
UPDATE "work_orders" SET "work_site_id" = (SELECT ws.id FROM "work_sites" ws LIMIT 1)
  WHERE "work_site_id" IS NULL;
ALTER TABLE "work_orders" ALTER COLUMN "work_site_id" SET NOT NULL;

-- Make code UNIQUE (was not unique before)
CREATE UNIQUE INDEX IF NOT EXISTS "work_orders_code_key" ON "work_orders"("code");

-- Add FK for closed_by
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_closed_by_user_id_fkey"
  FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add FK for pattern_supplier
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_pattern_supplier_id_fkey"
  FOREIGN KEY ("pattern_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 2. Transform garment_references: add new columns, change FK
-- ============================================================

-- Add new columns
ALTER TABLE "garment_references" ADD COLUMN "work_order_id" UUID;
ALTER TABLE "garment_references" ADD COLUMN "source" VARCHAR(32);
ALTER TABLE "garment_references" ADD COLUMN "lexi_external_id" VARCHAR(128);
ALTER TABLE "garment_references" ADD COLUMN "title" VARCHAR(255);
ALTER TABLE "garment_references" ADD COLUMN "status" VARCHAR(32) DEFAULT 'draft';
ALTER TABLE "garment_references" ADD COLUMN "attributes_json" JSONB;
ALTER TABLE "garment_references" ADD COLUMN "image_url" TEXT;

-- Make catalog fields nullable for lexi_catalog source
ALTER TABLE "garment_references" ALTER COLUMN "brand_id" DROP NOT NULL;
ALTER TABLE "garment_references" ALTER COLUMN "silhouette_id" DROP NOT NULL;
ALTER TABLE "garment_references" ALTER COLUMN "fabric_supply_id" DROP NOT NULL;

-- Default existing rows to source=work_order (they were linked to production_orders)
UPDATE "garment_references" SET "source" = 'work_order' WHERE "source" IS NULL;
ALTER TABLE "garment_references" ALTER COLUMN "source" SET NOT NULL;

-- Add unique indexes
CREATE UNIQUE INDEX "garment_references_work_order_id_key" ON "garment_references"("work_order_id");
CREATE UNIQUE INDEX "garment_references_lexi_external_id_key" ON "garment_references"("lexi_external_id");

-- Add FK for work_order_id
ALTER TABLE "garment_references" ADD CONSTRAINT "garment_references_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 3. Create work_order_size_curve_items (rename + re-FK)
-- ============================================================

CREATE TABLE "work_order_size_curve_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_id" UUID NOT NULL,
    "size_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "sort_order" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    CONSTRAINT "work_order_size_curve_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "work_order_size_curve_items_work_order_id_size_id_key"
  ON "work_order_size_curve_items"("work_order_id", "size_id");

ALTER TABLE "work_order_size_curve_items" ADD CONSTRAINT "work_order_size_curve_items_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_size_curve_items" ADD CONSTRAINT "work_order_size_curve_items_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_size_curve_items" ADD CONSTRAINT "work_order_size_curve_items_size_id_fkey"
  FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 4. Drop old FKs and tables
-- ============================================================

-- Drop FK from garment_references → production_orders
ALTER TABLE "garment_references" DROP CONSTRAINT IF EXISTS "garment_references_production_order_id_fkey";
DROP INDEX IF EXISTS "garment_references_production_order_id_key";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "production_order_id";

-- Drop FK from work_orders → production_orders
ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "work_orders_production_order_id_fkey";
ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "production_order_id";

-- Drop old size curve table
DROP TABLE IF EXISTS "production_order_size_curve_items";

-- Drop production_orders (must drop FKs referencing it first)
ALTER TABLE "production_orders" DROP CONSTRAINT IF EXISTS "production_orders_development_id_fkey";
ALTER TABLE "production_orders" DROP CONSTRAINT IF EXISTS "production_orders_created_by_user_id_fkey";
ALTER TABLE "production_orders" DROP CONSTRAINT IF EXISTS "production_orders_closed_by_user_id_fkey";
ALTER TABLE "production_orders" DROP CONSTRAINT IF EXISTS "production_orders_work_site_id_fkey";
ALTER TABLE "production_orders" DROP CONSTRAINT IF EXISTS "production_orders_pattern_supplier_id_fkey";
DROP TABLE IF EXISTS "production_orders";

-- Drop developments
ALTER TABLE "developments" DROP CONSTRAINT IF EXISTS "developments_created_by_user_id_fkey";
DROP TABLE IF EXISTS "developments";
