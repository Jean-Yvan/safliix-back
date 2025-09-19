/*
  Warnings:

  - The `status` column on the `movies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `main_image` on the `video_metadata` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryImage` on the `video_metadata` table. All the data in the column will be lost.
  - You are about to drop the `SeriesView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_files` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'IMAGE');

-- CreateEnum
CREATE TYPE "MediaFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaAttachmentType" AS ENUM ('MAIN', 'TRAILER', 'BONUS', 'MAKING_OF', 'CLIP', 'PREVIEW', 'ADVERTISEMENT', 'THUMBNAIL', 'POSTER', 'BANNER');

-- DropForeignKey
ALTER TABLE "SeriesView" DROP CONSTRAINT "SeriesView_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "Subtitle" DROP CONSTRAINT "Subtitle_videoId_fkey";

-- DropForeignKey
ALTER TABLE "video_attachments" DROP CONSTRAINT "video_attachments_adId_fkey";

-- DropForeignKey
ALTER TABLE "video_attachments" DROP CONSTRAINT "video_attachments_episodeId_fkey";

-- DropForeignKey
ALTER TABLE "video_attachments" DROP CONSTRAINT "video_attachments_movieId_fkey";

-- DropForeignKey
ALTER TABLE "video_attachments" DROP CONSTRAINT "video_attachments_videoFileId_fkey";

-- AlterTable
ALTER TABLE "movies" DROP COLUMN "status",
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "video_metadata" DROP COLUMN "main_image",
DROP COLUMN "secondaryImage";

-- DropTable
DROP TABLE "SeriesView";

-- DropTable
DROP TABLE "video_attachments";

-- DropTable
DROP TABLE "video_files";

-- DropEnum
DROP TYPE "VideoAttachmentType";

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "status" "MediaFileStatus" NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAttachment" (
    "id" TEXT NOT NULL,
    "mediaFileId" TEXT NOT NULL,
    "movieId" TEXT,
    "episodeId" TEXT,
    "adId" TEXT,
    "type" "MediaAttachmentType" NOT NULL,

    CONSTRAINT "MediaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieView" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonsWatched" INTEGER,
    "episodesWatched" INTEGER,
    "totalTimeSpent" INTEGER,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SerieView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SerieView_seriesId_userId_key" ON "SerieView"("seriesId", "userId");

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieView" ADD CONSTRAINT "SerieView_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "MediaFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
