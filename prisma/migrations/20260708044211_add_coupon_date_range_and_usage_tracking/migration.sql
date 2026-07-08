/*
  Warnings:

  - Added the required column `endDate` to the `coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coupon" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "couponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "couponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "couponUsage_orderId_key" ON "couponUsage"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "couponUsage_couponId_userId_key" ON "couponUsage"("couponId", "userId");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couponUsage" ADD CONSTRAINT "couponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couponUsage" ADD CONSTRAINT "couponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couponUsage" ADD CONSTRAINT "couponUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
