ALTER TABLE "suppliers"
  ADD COLUMN IF NOT EXISTS "bank_entity" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "bank_account_number" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "bank_account_type" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "bank_account_holder" VARCHAR(255);
