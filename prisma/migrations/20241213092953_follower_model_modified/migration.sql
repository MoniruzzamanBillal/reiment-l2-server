/*
  Warnings:

  - A unique constraint covering the columns `[customerId,shopId]` on the table `follower` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "follower_customerId_shopId_key" ON "follower"("customerId", "shopId");
