-- AlterTable
ALTER TABLE "orderItem" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_orderItemId_key" ON "reviews"("orderItemId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "orderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
