/*
  Warnings:

  - The values [READY] on the enum `MediaFileStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MediaFileStatus_new" AS ENUM ('PENDING', 'UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED', 'CANCELLED', 'QUEUED');
ALTER TABLE "MediaFile" ALTER COLUMN "status" TYPE "MediaFileStatus_new" USING ("status"::text::"MediaFileStatus_new");
ALTER TYPE "MediaFileStatus" RENAME TO "MediaFileStatus_old";
ALTER TYPE "MediaFileStatus_new" RENAME TO "MediaFileStatus";
DROP TYPE "MediaFileStatus_old";
COMMIT;
