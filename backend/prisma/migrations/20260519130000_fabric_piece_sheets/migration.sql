-- Marker on supply items to distinguish main fabric vs pocket fabric
ALTER TABLE "work_order_supply_items"
  ADD COLUMN IF NOT EXISTS "fabric_usage" VARCHAR(16) NOT NULL DEFAULT 'main';

-- Cabecera: una ficha por cada tela enviada en la OT (1:1 con work_order_supply_items)
CREATE TABLE IF NOT EXISTS "work_order_fabric_piece_sheets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "work_order_id" UUID NOT NULL,
  "work_order_supply_item_id" UUID NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'draft',
  "sheet_date" DATE,
  "sizes_placed" INTEGER,
  "real_average" DECIMAL(10,4),
  "marker_length" DECIMAL(10,4),
  "labeled_pieces_notes" TEXT,
  "pocket_fabric_notes" VARCHAR(255),
  "has_bias" BOOLEAN NOT NULL DEFAULT FALSE,
  "bias_weight" DECIMAL(10,4),
  "has_elastic" BOOLEAN NOT NULL DEFAULT FALSE,
  "has_zipper" BOOLEAN NOT NULL DEFAULT FALSE,
  "zipper_weight" DECIMAL(10,4),
  "has_luxury_zipper" BOOLEAN NOT NULL DEFAULT FALSE,
  "programmed_qty" INTEGER,
  "meters_to_use" DECIMAL(12,4),
  "leftover_meters" DECIMAL(12,4),
  "total_meters" DECIMAL(12,4) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  CONSTRAINT "work_order_fabric_piece_sheets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "work_order_fabric_piece_sheets_work_order_supply_item_id_key"
  ON "work_order_fabric_piece_sheets" ("work_order_supply_item_id");

CREATE INDEX IF NOT EXISTS "work_order_fabric_piece_sheets_work_order_id_idx"
  ON "work_order_fabric_piece_sheets" ("work_order_id");

ALTER TABLE "work_order_fabric_piece_sheets"
  ADD CONSTRAINT "work_order_fabric_piece_sheets_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_fabric_piece_sheets"
  ADD CONSTRAINT "work_order_fabric_piece_sheets_work_order_supply_item_id_fkey"
  FOREIGN KEY ("work_order_supply_item_id") REFERENCES "work_order_supply_items"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_fabric_piece_sheets"
  ADD CONSTRAINT "work_order_fabric_piece_sheets_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Piezas (tabla izquierda del Excel)
CREATE TABLE IF NOT EXISTS "work_order_fabric_piece_sheet_pieces" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "piece_sheet_id" UUID NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "name" VARCHAR(128) NOT NULL,
  "material_slot" INTEGER NOT NULL DEFAULT 1,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "is_pair" BOOLEAN NOT NULL DEFAULT FALSE,
  "image_url" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "work_order_fabric_piece_sheet_pieces_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "work_order_fabric_piece_sheet_pieces_piece_sheet_id_sort_order_idx"
  ON "work_order_fabric_piece_sheet_pieces" ("piece_sheet_id", "sort_order");

ALTER TABLE "work_order_fabric_piece_sheet_pieces"
  ADD CONSTRAINT "work_order_fabric_piece_sheet_pieces_piece_sheet_id_fkey"
  FOREIGN KEY ("piece_sheet_id") REFERENCES "work_order_fabric_piece_sheets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Rollos
CREATE TABLE IF NOT EXISTS "work_order_fabric_piece_sheet_rolls" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "piece_sheet_id" UUID NOT NULL,
  "roll_number" VARCHAR(64) NOT NULL,
  "meters" DECIMAL(12,4) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "work_order_fabric_piece_sheet_rolls_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "work_order_fabric_piece_sheet_rolls_piece_sheet_id_sort_order_idx"
  ON "work_order_fabric_piece_sheet_rolls" ("piece_sheet_id", "sort_order");

ALTER TABLE "work_order_fabric_piece_sheet_rolls"
  ADD CONSTRAINT "work_order_fabric_piece_sheet_rolls_piece_sheet_id_fkey"
  FOREIGN KEY ("piece_sheet_id") REFERENCES "work_order_fabric_piece_sheets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
