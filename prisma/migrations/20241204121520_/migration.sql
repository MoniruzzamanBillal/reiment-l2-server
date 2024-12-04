/*
  Warnings:

  - A unique constraint covering the columns `[trxnNumber]` on the table `order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "order_trxnNumber_key" ON "order"("trxnNumber");
