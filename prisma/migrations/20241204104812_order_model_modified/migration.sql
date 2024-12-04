-- AlterTable
ALTER TABLE "order" ADD COLUMN     "isDelated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orderItem" ADD COLUMN     "isDelated" BOOLEAN NOT NULL DEFAULT false;
