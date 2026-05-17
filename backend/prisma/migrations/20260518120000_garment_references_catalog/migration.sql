-- Brands: consecutivo 100-999
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "consecutivo" INTEGER;

UPDATE "brands" SET "consecutivo" = 100 + (ROW_NUMBER() OVER (ORDER BY "created_at"))::int
  WHERE "consecutivo" IS NULL;

ALTER TABLE "brands" ALTER COLUMN "consecutivo" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "brands_consecutivo_key" ON "brands"("consecutivo");

-- Garment references: catálogo manual (sin Lexi)
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "code" VARCHAR(9);
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "reference_type" VARCHAR(32);
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "serie" VARCHAR(3);
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "reference_sequence" INTEGER;
ALTER TABLE "garment_references" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Eliminar columnas Lexi / source
ALTER TABLE "garment_references" DROP CONSTRAINT IF EXISTS "garment_references_lexi_external_id_key";
DROP INDEX IF EXISTS "garment_references_lexi_external_id_key";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "lexi_external_id";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "source";
ALTER TABLE "garment_references" DROP COLUMN IF EXISTS "attributes_json";

CREATE UNIQUE INDEX IF NOT EXISTS "garment_references_code_key" ON "garment_references"("code");
