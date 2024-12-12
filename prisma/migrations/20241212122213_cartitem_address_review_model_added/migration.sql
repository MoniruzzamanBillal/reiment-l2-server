-- AlterTable
ALTER TABLE "cartItem" ADD COLUMN     "isDelated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orderItem" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
