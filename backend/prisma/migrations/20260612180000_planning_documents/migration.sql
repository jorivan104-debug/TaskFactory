-- ── Extensión: campos de planificación en piezas (corte, agrupación, rendimiento, gasto) ──
ALTER TABLE "work_order_fabric_piece_sheet_pieces"
  ADD COLUMN IF NOT EXISTS "cut_instructions" TEXT,
  ADD COLUMN IF NOT EXISTS "group_instructions" TEXT,
  ADD COLUMN IF NOT EXISTS "garments_yield" INTEGER,
  ADD COLUMN IF NOT EXISTS "fabric_usage" DECIMAL(12, 4);

-- ── Espigas del diseño del trazo (contenidas en la ficha por tela) ──
CREATE TABLE IF NOT EXISTS "work_order_fabric_piece_sheet_spikes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "piece_sheet_id" UUID NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "name" VARCHAR(128) NOT NULL,
  "length_cm" DECIMAL(10, 4),
  "width_cm" DECIMAL(10, 4),
  "quantity" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "work_order_fabric_piece_sheet_spikes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "work_order_fabric_piece_sheet_spikes_piece_sheet_id_sort_order_idx"
  ON "work_order_fabric_piece_sheet_spikes" ("piece_sheet_id", "sort_order");

ALTER TABLE "work_order_fabric_piece_sheet_spikes"
  ADD CONSTRAINT "work_order_fabric_piece_sheet_spikes_piece_sheet_id_fkey"
  FOREIGN KEY ("piece_sheet_id") REFERENCES "work_order_fabric_piece_sheets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Catálogo de puntos de medida (filas de la tabla de medidas) ──
CREATE TABLE IF NOT EXISTS "garment_measurement_points" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category" VARCHAR(64) NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" TEXT,
  "is_optional" BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "garment_measurement_points_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "garment_measurement_points_category_name_key"
  ON "garment_measurement_points" ("category", "name");

-- ── Tabla de medidas: cabecera 1:1 con la OT ──
CREATE TABLE IF NOT EXISTS "work_order_measurement_sheets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "work_order_id" UUID NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'draft',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  CONSTRAINT "work_order_measurement_sheets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "work_order_measurement_sheets_work_order_id_key"
  ON "work_order_measurement_sheets" ("work_order_id");

ALTER TABLE "work_order_measurement_sheets"
  ADD CONSTRAINT "work_order_measurement_sheets_work_order_id_fkey"
  FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_measurement_sheets"
  ADD CONSTRAINT "work_order_measurement_sheets_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Columnas (tallas) de la tabla de medidas ──
CREATE TABLE IF NOT EXISTS "work_order_measurement_sheet_columns" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sheet_id" UUID NOT NULL,
  "size_id" UUID NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "work_order_measurement_sheet_columns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "work_order_measurement_sheet_columns_sheet_id_size_id_key"
  ON "work_order_measurement_sheet_columns" ("sheet_id", "size_id");

CREATE INDEX IF NOT EXISTS "work_order_measurement_sheet_columns_sheet_id_sort_order_idx"
  ON "work_order_measurement_sheet_columns" ("sheet_id", "sort_order");

ALTER TABLE "work_order_measurement_sheet_columns"
  ADD CONSTRAINT "work_order_measurement_sheet_columns_sheet_id_fkey"
  FOREIGN KEY ("sheet_id") REFERENCES "work_order_measurement_sheets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_measurement_sheet_columns"
  ADD CONSTRAINT "work_order_measurement_sheet_columns_size_id_fkey"
  FOREIGN KEY ("size_id") REFERENCES "sizes"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Celdas (punto de medida × talla) de la tabla de medidas ──
CREATE TABLE IF NOT EXISTS "work_order_measurement_sheet_cells" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sheet_id" UUID NOT NULL,
  "garment_measurement_point_id" UUID NOT NULL,
  "size_id" UUID NOT NULL,
  "value_cm" DECIMAL(8, 2),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "work_order_measurement_sheet_cells_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "work_order_measurement_sheet_cells_sheet_id_point_id_size_id_key"
  ON "work_order_measurement_sheet_cells" ("sheet_id", "garment_measurement_point_id", "size_id");

ALTER TABLE "work_order_measurement_sheet_cells"
  ADD CONSTRAINT "work_order_measurement_sheet_cells_sheet_id_fkey"
  FOREIGN KEY ("sheet_id") REFERENCES "work_order_measurement_sheets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_measurement_sheet_cells"
  ADD CONSTRAINT "work_order_measurement_sheet_cells_garment_point_fkey"
  FOREIGN KEY ("garment_measurement_point_id") REFERENCES "garment_measurement_points"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_measurement_sheet_cells"
  ADD CONSTRAINT "work_order_measurement_sheet_cells_size_id_fkey"
  FOREIGN KEY ("size_id") REFERENCES "sizes"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
