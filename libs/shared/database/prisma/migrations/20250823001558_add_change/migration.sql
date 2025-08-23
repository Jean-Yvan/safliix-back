/*
  Warnings:

  - You are about to drop the column `categoryid` on the `video_metadata` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `video_metadata` table without a default value. This is not possible if the table is not empty.
  - Made the column `formatId` on table `video_metadata` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_categoryid_fkey";

-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_formatId_fkey";

-- AlterTable
ALTER TABLE "video_metadata" DROP COLUMN "categoryid",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ALTER COLUMN "formatId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "VideoFormat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VideoCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
