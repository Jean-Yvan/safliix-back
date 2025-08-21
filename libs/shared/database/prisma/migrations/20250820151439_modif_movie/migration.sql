/*
  Warnings:

  - You are about to drop the column `duration_seconds` on the `video_metadata` table. All the data in the column will be lost.
  - You are about to drop the column `production` on the `video_metadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "video_metadata" DROP COLUMN "duration_seconds",
DROP COLUMN "production";
