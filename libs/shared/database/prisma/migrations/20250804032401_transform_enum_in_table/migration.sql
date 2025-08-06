/*
  Warnings:

  - You are about to drop the `VideoFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoMetadata` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[metadataId]` on the table `episodes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Subtitle" DROP CONSTRAINT "Subtitle_videoId_fkey";

-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_videoId_fkey";

-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_videoFileId_fkey";

-- DropForeignKey
ALTER TABLE "movies" DROP CONSTRAINT "movies_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "movies" DROP CONSTRAINT "movies_videoFileId_fkey";

-- DropForeignKey
ALTER TABLE "series" DROP CONSTRAINT "series_metadataId_fkey";

-- AlterTable
ALTER TABLE "Subtitle" ADD COLUMN     "videoMetadataId" TEXT;

-- DropTable
DROP TABLE "VideoFile";

-- DropTable
DROP TABLE "VideoMetadata";

-- CreateTable
CREATE TABLE "video_metadata" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "main_image" TEXT NOT NULL,
    "secondaryImage" TEXT,
    "theater_release" TIMESTAMP(3) NOT NULL,
    "platform_publish" TIMESTAMP(3) NOT NULL,
    "ageRating" "AgeRating" NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "productionHouse" TEXT NOT NULL,
    "productionCountry" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "formatid" TEXT,
    "categoryid" TEXT,
    "status" "ContentStatus" NOT NULL,
    "production" TEXT NOT NULL DEFAULT 'Safliix',

    CONSTRAINT "video_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_files" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "trailerPath" TEXT,
    "duration_seconds" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "formatId" TEXT NOT NULL,

    CONSTRAINT "video_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "video_genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_actors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "video_actors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "video_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoFormat" (
    "id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "VideoFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoCategory" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "VideoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VideoGenreToVideoMetadata" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VideoGenreToVideoMetadata_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_VideoActorToVideoMetadata" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VideoActorToVideoMetadata_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_VideoLanguageToVideoMetadata" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VideoLanguageToVideoMetadata_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_genres_name_key" ON "video_genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "video_languages_code_key" ON "video_languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VideoFormat_format_key" ON "VideoFormat"("format");

-- CreateIndex
CREATE UNIQUE INDEX "VideoCategory_category_key" ON "VideoCategory"("category");

-- CreateIndex
CREATE INDEX "_VideoGenreToVideoMetadata_B_index" ON "_VideoGenreToVideoMetadata"("B");

-- CreateIndex
CREATE INDEX "_VideoActorToVideoMetadata_B_index" ON "_VideoActorToVideoMetadata"("B");

-- CreateIndex
CREATE INDEX "_VideoLanguageToVideoMetadata_B_index" ON "_VideoLanguageToVideoMetadata"("B");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_metadataId_key" ON "episodes"("metadataId");

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_formatid_fkey" FOREIGN KEY ("formatid") REFERENCES "VideoFormat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_categoryid_fkey" FOREIGN KEY ("categoryid") REFERENCES "VideoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_files" ADD CONSTRAINT "video_files_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "VideoFormat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "video_metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "video_metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "video_metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_videoMetadataId_fkey" FOREIGN KEY ("videoMetadataId") REFERENCES "video_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoGenreToVideoMetadata" ADD CONSTRAINT "_VideoGenreToVideoMetadata_A_fkey" FOREIGN KEY ("A") REFERENCES "video_genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoGenreToVideoMetadata" ADD CONSTRAINT "_VideoGenreToVideoMetadata_B_fkey" FOREIGN KEY ("B") REFERENCES "video_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoActorToVideoMetadata" ADD CONSTRAINT "_VideoActorToVideoMetadata_A_fkey" FOREIGN KEY ("A") REFERENCES "video_actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoActorToVideoMetadata" ADD CONSTRAINT "_VideoActorToVideoMetadata_B_fkey" FOREIGN KEY ("B") REFERENCES "video_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoLanguageToVideoMetadata" ADD CONSTRAINT "_VideoLanguageToVideoMetadata_A_fkey" FOREIGN KEY ("A") REFERENCES "video_languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoLanguageToVideoMetadata" ADD CONSTRAINT "_VideoLanguageToVideoMetadata_B_fkey" FOREIGN KEY ("B") REFERENCES "video_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
