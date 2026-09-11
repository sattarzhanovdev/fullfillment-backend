-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "wbSupplyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_wbSupplyId_key" ON "Shipment"("wbSupplyId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
