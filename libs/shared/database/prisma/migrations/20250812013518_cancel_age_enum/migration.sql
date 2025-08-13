/*
  Warnings:

  - Changed the type of `ageRating` on the `video_metadata` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "video_metadata" DROP COLUMN "ageRating",
ADD COLUMN     "ageRating" TEXT NOT NULL;
