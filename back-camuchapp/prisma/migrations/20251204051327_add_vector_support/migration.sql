-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "producto" ADD COLUMN     "embedding" vector(768);
