-- Supply consumption model: BOM, WO supply items, kittings, warehouse flags, stock fields, size curve

-- 1. Warehouse flags
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "is_primary_supplies" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "is_primary_finished_goods" BOOLEAN NOT NULL DEFAULT false;

-- 2. Supply stock demand columns
ALTER TABLE "supplies" ADD COLUMN IF NOT EXISTS "stock_requested" DECIMAL(18,4) NOT NULL DEFAULT 0;
ALTER TABLE "supplies" ADD COLUMN IF NOT EXISTS "stock_shortage" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- 3. GarmentReference: source catalog + total_sizes_count
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "source_catalog_reference_id" UUID;
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "total_sizes_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "garment_references"
  ADD CONSTRAINT "garment_references_source_catalog_reference_id_fkey"
  FOREIGN KEY ("source_catalog_reference_id") REFERENCES "garment_references"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. WorkOrder: catalog_bom_copied_at
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "catalog_bom_copied_at" TIMESTAMPTZ;

-- 5. Size curve: rename quantity → programmed_qty, add cut_qty
ALTER TABLE "work_order_size_curve_items" RENAME COLUMN "quantity" TO "programmed_qty";
ALTER TABLE "work_order_size_curve_items" ALTER COLUMN "programmed_qty" TYPE INTEGER USING "programmed_qty"::integer;
ALTER TABLE "work_order_size_curve_items" ALTER COLUMN "programmed_qty" SET NOT NULL;
ALTER TABLE "work_order_size_curve_items" ALTER COLUMN "programmed_qty" SET DEFAULT 0;
ALTER TABLE "work_order_size_curve_items" ADD COLUMN IF NOT EXISTS "cut_qty" INTEGER NOT NULL DEFAULT 0;

-- 6. BOM: garment_reference_supply_requirements
CREATE TABLE "garment_reference_supply_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "garment_reference_id" UUID NOT NULL,
    "supply_id" UUID NOT NULL,
    "quantity_per_garment" DECIMAL(18,4) NOT NULL,
    "sort_order" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "garment_reference_supply_requirements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "garment_reference_supply_requirements_ref_supply_key"
  ON "garment_reference_supply_requirements"("garment_reference_id", "supply_id");

ALTER TABLE "garment_reference_supply_requirements"
  ADD CONSTRAINT "garment_reference_supply_requirements_garment_reference_id_fkey"
  FOREIGN KEY ("garment_reference_id") REFERENCES "garment_references"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "garment_reference_supply_requirements"
  ADD CONSTRAINT "garment_reference_supply_requirements_supply_id_fkey"
  FOREIGN KEY ("supply_id") REFERENCES "supplies"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "garment_reference_supply_requirements"
  ADD CONSTRAINT "garment_reference_supply_requirements_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Work order supply items
CREATE TABLE "work_order_supply_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_id" UUID NOT NULL,
    "supply_id" UUID NOT NULL,
    "quantity_per_garment" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "required_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "staged_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "executed_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "source_requirement_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_supply_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "work_order_supply_items_wo_supply_key"
  ON "work_order_supply_items"("work_order_id", "supply_id");

ALTER TABLE "work_order_supply_items"
  ADD CONSTRAINT "work_order_supply_items_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_items"
  ADD CONSTRAINT "work_order_supply_items_supply_id_fkey"
  FOREIGN KEY ("supply_id") REFERENCES "supplies"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_items"
  ADD CONSTRAINT "work_order_supply_items_source_requirement_id_fkey"
  FOREIGN KEY ("source_requirement_id") REFERENCES "garment_reference_supply_requirements"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_items"
  ADD CONSTRAINT "work_order_supply_items_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. Work order supply kittings (header)
CREATE TABLE "work_order_supply_kittings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "execution_state_key" VARCHAR(128) NOT NULL,
    "source_warehouse_id" UUID NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "transported_by_user_id" UUID,
    "transported_at" TIMESTAMPTZ,
    "received_by_user_id" UUID,
    "received_at" TIMESTAMPTZ,
    "executed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_supply_kittings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "work_order_supply_kittings_wo_code_key"
  ON "work_order_supply_kittings"("work_order_id", "code");

ALTER TABLE "work_order_supply_kittings"
  ADD CONSTRAINT "work_order_supply_kittings_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kittings"
  ADD CONSTRAINT "work_order_supply_kittings_source_warehouse_id_fkey"
  FOREIGN KEY ("source_warehouse_id") REFERENCES "warehouses"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kittings"
  ADD CONSTRAINT "work_order_supply_kittings_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kittings"
  ADD CONSTRAINT "work_order_supply_kittings_transported_by_user_id_fkey"
  FOREIGN KEY ("transported_by_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kittings"
  ADD CONSTRAINT "work_order_supply_kittings_received_by_user_id_fkey"
  FOREIGN KEY ("received_by_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. Work order supply kitting items (detail)
CREATE TABLE "work_order_supply_kitting_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kitting_id" UUID NOT NULL,
    "work_order_supply_item_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "executed_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_supply_kitting_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "work_order_supply_kitting_items"
  ADD CONSTRAINT "work_order_supply_kitting_items_kitting_id_fkey"
  FOREIGN KEY ("kitting_id") REFERENCES "work_order_supply_kittings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kitting_items"
  ADD CONSTRAINT "work_order_supply_kitting_items_wo_supply_item_id_fkey"
  FOREIGN KEY ("work_order_supply_item_id") REFERENCES "work_order_supply_items"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. Unused material returns
CREATE TABLE "work_order_supply_kitting_unused_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kitting_id" UUID NOT NULL,
    "work_order_supply_item_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_supply_kitting_unused_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "work_order_supply_kitting_unused_items"
  ADD CONSTRAINT "work_order_supply_kitting_unused_items_kitting_id_fkey"
  FOREIGN KEY ("kitting_id") REFERENCES "work_order_supply_kittings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kitting_unused_items"
  ADD CONSTRAINT "work_order_supply_kitting_unused_items_wo_supply_item_id_fkey"
  FOREIGN KEY ("work_order_supply_item_id") REFERENCES "work_order_supply_items"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_supply_kitting_unused_items"
  ADD CONSTRAINT "work_order_supply_kitting_unused_items_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
