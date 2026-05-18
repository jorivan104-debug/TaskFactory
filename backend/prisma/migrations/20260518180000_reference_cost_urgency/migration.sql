-- Urgencia en órdenes de trabajo
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "urgency" VARCHAR(32) NOT NULL DEFAULT 'normal';
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "supply_cost_total" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- Costo de referencia (suma de insumos BOM)
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "reference_cost" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- Valor unitario por línea de insumo en BOM de referencia
ALTER TABLE "garment_reference_supply_requirements" ADD COLUMN IF NOT EXISTS "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- Valor unitario por línea de insumo en OT
ALTER TABLE "work_order_supply_items" ADD COLUMN IF NOT EXISTS "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0;
