/*
  Warnings:

  - The `status` column on the `video_metadata` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_VideoGenreToVideoMetadata` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `genderId` to the `video_metadata` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_VideoGenreToVideoMetadata" DROP CONSTRAINT "_VideoGenreToVideoMetadata_A_fkey";

-- DropForeignKey
ALTER TABLE "_VideoGenreToVideoMetadata" DROP CONSTRAINT "_VideoGenreToVideoMetadata_B_fkey";

-- AlterTable
ALTER TABLE "video_metadata" ADD COLUMN     "genderId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "_VideoGenreToVideoMetadata";

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "video_genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
