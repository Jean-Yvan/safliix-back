/*
  Warnings:

  - You are about to drop the column `role` on the `video_actors` table. All the data in the column will be lost.
  - You are about to drop the `_VideoActorToVideoMetadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_VideoActorToVideoMetadata" DROP CONSTRAINT "_VideoActorToVideoMetadata_A_fkey";

-- DropForeignKey
ALTER TABLE "_VideoActorToVideoMetadata" DROP CONSTRAINT "_VideoActorToVideoMetadata_B_fkey";

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "isPremiere" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentalPrice" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "series" ADD COLUMN     "isPremiere" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentalPrice" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "video_actors" DROP COLUMN "role";

-- DropTable
DROP TABLE "_VideoActorToVideoMetadata";

-- CreateTable
CREATE TABLE "VideoActor" (
    "videoId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "VideoActor_pkey" PRIMARY KEY ("videoId","actorId")
);

-- AddForeignKey
ALTER TABLE "VideoActor" ADD CONSTRAINT "VideoActor_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video_metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoActor" ADD CONSTRAINT "VideoActor_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "video_actors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
