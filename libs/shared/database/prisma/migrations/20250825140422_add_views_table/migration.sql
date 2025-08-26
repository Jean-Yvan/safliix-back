/*
  Warnings:

  - You are about to drop the column `created_at` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `expiration_date` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_date` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `SharedAccount` table. All the data in the column will be lost.
  - You are about to drop the column `shared_on` on the `SharedAccount` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `SharedAccountUser` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `SharedAccountUser` table. All the data in the column will be lost.
  - You are about to drop the column `is_kid_profile` on the `SharedAccountUser` table. All the data in the column will be lost.
  - You are about to drop the column `pin_code` on the `SharedAccountUser` table. All the data in the column will be lost.
  - You are about to drop the column `profile_name` on the `SharedAccountUser` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `renewal_status` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle_url` on the `Subtitle` table. All the data in the column will be lost.
  - You are about to drop the column `progress_seconds` on the `View` table. All the data in the column will be lost.
  - You are about to drop the column `viewed_at` on the `View` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sharedAccountId,profileName]` on the table `SharedAccountUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileName` to the `SharedAccountUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtitleUrl` to the `Subtitle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_userId_fkey";

-- DropIndex
DROP INDEX "SharedAccountUser_sharedAccountId_profile_name_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "expiration_date",
DROP COLUMN "purchase_date",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SharedAccount" DROP COLUMN "is_active",
DROP COLUMN "shared_on",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sharedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SharedAccountUser" DROP COLUMN "avatar_url",
DROP COLUMN "created_at",
DROP COLUMN "is_kid_profile",
DROP COLUMN "pin_code",
DROP COLUMN "profile_name",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "iskidProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "profileName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "end_date",
DROP COLUMN "renewal_status",
DROP COLUMN "start_date",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "renewalStatus" "RenewalStatus" NOT NULL DEFAULT 'AUTO_RENEW',
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subtitle" DROP COLUMN "subtitle_url",
ADD COLUMN     "subtitleUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "View" DROP COLUMN "progress_seconds",
DROP COLUMN "viewed_at",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "progressSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MovieView" (
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "MovieView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodeView" (
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,

    CONSTRAINT "EpisodeView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonView" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "episodesWatched" INTEGER,
    "totalTimeSpent" INTEGER,
    "rating" DOUBLE PRECISION,

    CONSTRAINT "SeasonView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesView" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonsWatched" INTEGER,
    "episodesWatched" INTEGER,
    "totalTimeSpent" INTEGER,
    "rating" DOUBLE PRECISION,

    CONSTRAINT "SeriesView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieView_viewId_key" ON "MovieView"("viewId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeView_viewId_key" ON "EpisodeView"("viewId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedAccountUser_sharedAccountId_profileName_key" ON "SharedAccountUser"("sharedAccountId", "profileName");

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieView" ADD CONSTRAINT "MovieView_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieView" ADD CONSTRAINT "MovieView_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeView" ADD CONSTRAINT "EpisodeView_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeView" ADD CONSTRAINT "EpisodeView_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonView" ADD CONSTRAINT "SeasonView_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesView" ADD CONSTRAINT "SeriesView_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
