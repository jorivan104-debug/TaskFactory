-- CreateTable
CREATE TABLE "work_order_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_blueprints" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_type_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(16) NOT NULL DEFAULT 'draft',
    "definition_json" JSONB NOT NULL,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by_user_id" UUID NOT NULL,

    CONSTRAINT "work_order_blueprints_pkey" PRIMARY KEY ("id")
);

-- AlterTable work_orders: add blueprint columns
ALTER TABLE "work_orders" ADD COLUMN "work_order_type_id" UUID;
ALTER TABLE "work_orders" ADD COLUMN "current_state_key" VARCHAR(128);
ALTER TABLE "work_orders" ADD COLUMN "blueprint_version" INTEGER;
ALTER TABLE "work_orders" ADD COLUMN "blueprint_snapshot_json" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "work_order_types_code_key" ON "work_order_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_blueprints_work_order_type_id_key" ON "work_order_blueprints"("work_order_type_id");

-- AddForeignKey
ALTER TABLE "work_order_types" ADD CONSTRAINT "work_order_types_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_blueprints" ADD CONSTRAINT "work_order_blueprints_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_blueprints" ADD CONSTRAINT "work_order_blueprints_work_order_type_id_fkey" FOREIGN KEY ("work_order_type_id") REFERENCES "work_order_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_work_order_type_id_fkey" FOREIGN KEY ("work_order_type_id") REFERENCES "work_order_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
