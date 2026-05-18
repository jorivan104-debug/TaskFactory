-- Tipo de proveedor
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "supplier_type" VARCHAR(64) NOT NULL DEFAULT 'otro';

-- Talleres en orden de trabajo
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "cutting_supplier_id" UUID;
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "confection_supplier_id" UUID;

ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "work_orders_cutting_supplier_id_fkey";
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_cutting_supplier_id_fkey"
  FOREIGN KEY ("cutting_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "work_orders_confection_supplier_id_fkey";
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_confection_supplier_id_fkey"
  FOREIGN KEY ("confection_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Actividades de cerrado
CREATE TABLE IF NOT EXISTS "work_order_closing_activities" (
  "id" UUID NOT NULL,
  "work_order_id" UUID NOT NULL,
  "activity_name" VARCHAR(255) NOT NULL,
  "performed_by" VARCHAR(255),
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "work_order_closing_activities_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "work_order_closing_activities" DROP CONSTRAINT IF EXISTS "work_order_closing_activities_work_order_id_fkey";
ALTER TABLE "work_order_closing_activities" ADD CONSTRAINT "work_order_closing_activities_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
