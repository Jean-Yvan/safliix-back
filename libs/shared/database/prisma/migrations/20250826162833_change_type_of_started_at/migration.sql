/*
  Warnings:

  - You are about to drop the `EpisodeView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MovieView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `View` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[seasonId,userId]` on the table `SeasonView` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seriesId,userId]` on the table `SeriesView` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SeasonView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SeriesView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SharedAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SharedAccountUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VideoActor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VideoCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VideoFormat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `episodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `video_actors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `video_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `video_genres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `video_languages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `video_metadata` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EpisodeView" DROP CONSTRAINT "EpisodeView_episodeId_fkey";

-- DropForeignKey
ALTER TABLE "EpisodeView" DROP CONSTRAINT "EpisodeView_viewId_fkey";

-- DropForeignKey
ALTER TABLE "MovieView" DROP CONSTRAINT "MovieView_movieId_fkey";

-- DropForeignKey
ALTER TABLE "MovieView" DROP CONSTRAINT "MovieView_viewId_fkey";

-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_profileId_fkey";

-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_userId_fkey";

-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_videoId_fkey";

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SeasonView" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SeriesView" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SharedAccount" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SharedAccountUser" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VideoActor" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VideoCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VideoFormat" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "series" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "video_actors" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "video_files" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "video_genres" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "video_languages" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "video_metadata" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "EpisodeView";

-- DropTable
DROP TABLE "MovieView";

-- DropTable
DROP TABLE "View";

-- CreateTable
CREATE TABLE "user_video_view" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "videoId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "device" TEXT,
    "rating" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_video_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonView_seasonId_userId_key" ON "SeasonView"("seasonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesView_seriesId_userId_key" ON "SeriesView"("seriesId", "userId");

-- AddForeignKey
ALTER TABLE "user_video_view" ADD CONSTRAINT "user_video_view_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_video_view" ADD CONSTRAINT "user_video_view_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonView" ADD CONSTRAINT "SeasonView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
