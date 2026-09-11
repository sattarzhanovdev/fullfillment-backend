-- AlterTable
ALTER TABLE "MarketplaceOrder" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "barcode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_barcode_key" ON "Shipment"("barcode");
