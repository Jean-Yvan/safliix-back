/*
  Warnings:

  - You are about to drop the column `formatid` on the `video_metadata` table. All the data in the column will be lost.
  - Added the required column `status` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formatId` to the `video_metadata` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_formatid_fkey";

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "video_metadata" DROP COLUMN "formatid",
ADD COLUMN     "formatId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "VideoFormat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
