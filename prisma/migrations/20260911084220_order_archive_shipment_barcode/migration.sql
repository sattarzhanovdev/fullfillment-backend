-- AlterTable
ALTER TABLE "MarketplaceOrder" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "barcode" TEXT;

-- Бэкафилл для уже существующих отгрузок (случайный 12-значный штрихкод, как генерирует приложение)
UPDATE "Shipment" SET "barcode" = lpad(floor(random() * 1000000000000)::text, 12, '0') WHERE "barcode" IS NULL;

ALTER TABLE "Shipment" ALTER COLUMN "barcode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_barcode_key" ON "Shipment"("barcode");
