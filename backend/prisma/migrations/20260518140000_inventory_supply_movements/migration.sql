-- Inventario por insumo (supply): movimientos de ajuste y lotes por almacén

ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "supply_id" UUID;
ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "inventory_movements" ALTER COLUMN "product_id" DROP NOT NULL;

ALTER TABLE "inventory_movements"
  ADD CONSTRAINT "inventory_movements_supply_id_fkey"
  FOREIGN KEY ("supply_id") REFERENCES "supplies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "inventory_movements_supply_id_occurred_at_idx"
  ON "inventory_movements"("supply_id", "occurred_at" DESC);

ALTER TABLE "inventory_stock_lots" ADD COLUMN IF NOT EXISTS "supply_id" UUID;
ALTER TABLE "inventory_stock_lots" ALTER COLUMN "product_id" DROP NOT NULL;

ALTER TABLE "inventory_stock_lots"
  ADD CONSTRAINT "inventory_stock_lots_supply_id_fkey"
  FOREIGN KEY ("supply_id") REFERENCES "supplies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_stock_lots_warehouse_supply_lot_key"
  ON "inventory_stock_lots"("warehouse_id", "supply_id", COALESCE("lot_code", ''));
