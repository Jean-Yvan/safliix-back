/*
  Warnings:

  - You are about to drop the column `title` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `age_rating` on the `VideoMetadata` table. All the data in the column will be lost.
  - You are about to drop the column `release_date` on the `VideoMetadata` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_url` on the `VideoMetadata` table. All the data in the column will be lost.
  - You are about to drop the `Episode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ageRating` to the `VideoMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `VideoMetadata` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `VideoMetadata` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_videoId_fkey";

-- DropForeignKey
ALTER TABLE "MovieTag" DROP CONSTRAINT "MovieTag_movieId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "Series" DROP CONSTRAINT "Series_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "SeriesTag" DROP CONSTRAINT "SeriesTag_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "Subtitle" DROP CONSTRAINT "Subtitle_videoId_fkey";

-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_videoId_fkey";

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "VideoMetadata" DROP COLUMN "age_rating",
DROP COLUMN "release_date",
DROP COLUMN "thumbnail_url",
ADD COLUMN     "ageRating" "AgeRating" NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- DropTable
DROP TABLE "Episode";

-- DropTable
DROP TABLE "Movie";

-- DropTable
DROP TABLE "Series";

-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "VideoFile" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "VideoFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" TEXT NOT NULL,
    "metadataId" TEXT NOT NULL,
    "videoFileId" TEXT NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "metadataId" TEXT NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "videoFileId" TEXT NOT NULL,
    "metadataId" TEXT NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_metadataId_key" ON "movies"("metadataId");

-- CreateIndex
CREATE UNIQUE INDEX "movies_videoFileId_key" ON "movies"("videoFileId");

-- CreateIndex
CREATE UNIQUE INDEX "series_metadataId_key" ON "series"("metadataId");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_videoFileId_key" ON "episodes"("videoFileId");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_seasonId_number_key" ON "episodes"("seasonId", "number");

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "VideoMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "VideoMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "VideoMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieTag" ADD CONSTRAINT "MovieTag_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesTag" ADD CONSTRAINT "SeriesTag_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
