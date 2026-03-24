-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "observations" TEXT;
