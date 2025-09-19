/*
  Warnings:

  - You are about to drop the column `end_date` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `seriesId` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `videoFileId` on the `episodes` table. All the data in the column will be lost.
  - You are about to drop the column `videoFileId` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `duration_seconds` on the `video_files` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `video_files` table. All the data in the column will be lost.
  - You are about to drop the column `trailerPath` on the `video_files` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serieId,number]` on the table `Season` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serieId` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `video_files` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoAttachmentType" AS ENUM ('MOVIE', 'EPISODE', 'AD');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_videoFileId_fkey";

-- DropForeignKey
ALTER TABLE "movies" DROP CONSTRAINT "movies_videoFileId_fkey";

-- DropForeignKey
ALTER TABLE "user_video_view" DROP CONSTRAINT "user_video_view_videoId_fkey";

-- DropIndex
DROP INDEX "Season_seriesId_number_key";

-- DropIndex
DROP INDEX "episodes_videoFileId_key";

-- DropIndex
DROP INDEX "movies_videoFileId_key";

-- AlterTable
ALTER TABLE "Ad" DROP COLUMN "end_date",
DROP COLUMN "image_url",
DROP COLUMN "is_active",
DROP COLUMN "start_date",
DROP COLUMN "video_url",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "videoId",
ADD COLUMN     "epiisodeId" TEXT,
ADD COLUMN     "movieId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "videoId",
ADD COLUMN     "movieId" TEXT,
ADD COLUMN     "serieId" TEXT;

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "seriesId",
ADD COLUMN     "serieId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "episodes" DROP COLUMN "videoFileId";

-- AlterTable
ALTER TABLE "movies" DROP COLUMN "videoFileId";

-- AlterTable
ALTER TABLE "video_files" DROP COLUMN "duration_seconds",
DROP COLUMN "filePath",
DROP COLUMN "trailerPath",
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "video_attachments" (
    "id" TEXT NOT NULL,
    "videoFileId" TEXT NOT NULL,
    "movieId" TEXT,
    "episodeId" TEXT,
    "adId" TEXT,
    "type" "VideoAttachmentType" NOT NULL,

    CONSTRAINT "video_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_serieId_number_key" ON "Season"("serieId", "number");

-- AddForeignKey
ALTER TABLE "video_attachments" ADD CONSTRAINT "video_attachments_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_attachments" ADD CONSTRAINT "video_attachments_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_attachments" ADD CONSTRAINT "video_attachments_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_attachments" ADD CONSTRAINT "video_attachments_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_epiisodeId_fkey" FOREIGN KEY ("epiisodeId") REFERENCES "episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
