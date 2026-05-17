-- Brands: consecutivo 100-999 (PostgreSQL no permite ventanas en SET directo)
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "consecutivo" INTEGER;

UPDATE "brands" b
SET "consecutivo" = ranked.c
FROM (
  SELECT id, (99 + ROW_NUMBER() OVER (ORDER BY "created_at"))::integer AS c
  FROM "brands"
) ranked
WHERE b.id = ranked.id
  AND b."consecutivo" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "brands" WHERE "consecutivo" IS NULL) THEN
    RAISE EXCEPTION 'brands.consecutivo: quedaron filas sin valor; revise datos de marcas';
  END IF;
END $$;

ALTER TABLE "brands" ALTER COLUMN "consecutivo" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "brands_consecutivo_key" ON "brands"("consecutivo");

-- Garment references: catálogo manual (sin Lexi)
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "code" VARCHAR(9);
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "reference_type" VARCHAR(32);
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "serie" VARCHAR(3);
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "reference_sequence" INTEGER;
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Catálogo Lexi legacy sin marca: no migrable al nuevo modelo
DELETE FROM "garment_references"
WHERE "work_order_id" IS NULL
  AND "brand_id" IS NULL;

-- OT u otras filas sin marca: asignar primera marca si existe
UPDATE "garment_references" gr
SET "brand_id" = (SELECT id FROM "brands" ORDER BY "created_at" LIMIT 1)
WHERE gr."brand_id" IS NULL
  AND EXISTS (SELECT 1 FROM "brands" LIMIT 1);

DELETE FROM "garment_references" WHERE "brand_id" IS NULL;

UPDATE "garment_references"
SET "reference_type" = CASE
  WHEN "source" = 'work_order' OR "work_order_id" IS NOT NULL THEN 'produccion'
  ELSE 'muestra'
END
WHERE "reference_type" IS NULL;

WITH seq AS (
  SELECT
    id,
    (99 + ROW_NUMBER() OVER (PARTITION BY "brand_id" ORDER BY "created_at"))::integer AS ref_seq
  FROM "garment_references"
  WHERE "reference_sequence" IS NULL
)
UPDATE "garment_references" gr
SET "reference_sequence" = seq.ref_seq
FROM seq
WHERE gr.id = seq.id;

WITH serie_calc AS (
  SELECT
    id,
    (CASE WHEN "reference_type" = 'produccion' THEN 'P' ELSE 'M' END)
      || LPAD(
        (ROW_NUMBER() OVER (
          PARTITION BY "brand_id", "reference_type"
          ORDER BY "created_at"
        ) - 1)::text,
        2,
        '0'
      ) AS serie_val
  FROM "garment_references"
  WHERE "serie" IS NULL
)
UPDATE "garment_references" gr
SET "serie" = sc.serie_val
FROM serie_calc sc
WHERE gr.id = sc.id;

UPDATE "garment_references" gr
SET "code" =
  b."consecutivo"::text
  || LPAD(gr."reference_sequence"::text, 3, '0')
  || gr."serie"
FROM "brands" b
WHERE gr."brand_id" = b.id
  AND gr."code" IS NULL
  AND gr."reference_sequence" IS NOT NULL
  AND gr."serie" IS NOT NULL;

-- Eliminar columnas Lexi / source
ALTER TABLE "garment_references" DROP CONSTRAINT IF EXISTS "garment_references_lexi_external_id_key";
DROP INDEX IF EXISTS "garment_references_lexi_external_id_key";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "lexi_external_id";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "source";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "attributes_json";

CREATE UNIQUE INDEX IF NOT EXISTS "garment_references_code_key" ON "garment_references"("code");
