/*
  Warnings:

  - You are about to drop the column `packagingTypeId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MarketplaceOrder" ADD COLUMN     "packagingTypeId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "packagingTypeId",
ADD COLUMN     "qtyPacked" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "MarketplaceOrder" ADD CONSTRAINT "MarketplaceOrder_packagingTypeId_fkey" FOREIGN KEY ("packagingTypeId") REFERENCES "PackagingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
