/*
  Warnings:

  - You are about to drop the column `formatId` on the `video_files` table. All the data in the column will be lost.
  - Made the column `formatid` on table `video_metadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryid` on table `video_metadata` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "video_files" DROP CONSTRAINT "video_files_formatId_fkey";

-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_categoryid_fkey";

-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_formatid_fkey";

-- AlterTable
ALTER TABLE "video_files" DROP COLUMN "formatId";

-- AlterTable
ALTER TABLE "video_metadata" ALTER COLUMN "formatid" SET NOT NULL,
ALTER COLUMN "categoryid" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_formatid_fkey" FOREIGN KEY ("formatid") REFERENCES "VideoFormat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_categoryid_fkey" FOREIGN KEY ("categoryid") REFERENCES "VideoCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
