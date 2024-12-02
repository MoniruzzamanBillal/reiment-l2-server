-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('BLOCKED', 'ACTIVE');

-- AlterTable
ALTER TABLE "shop" ADD COLUMN     "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE';
