/*
  Warnings:

  - You are about to drop the column `metadataId` on the `episodes` table. All the data in the column will be lost.
  - Added the required column `director` to the `episodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSaFliixProd` to the `episodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plateformeDAte` to the `episodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseDate` to the `episodes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_formatId_fkey";

-- DropIndex
DROP INDEX "episodes_metadataId_key";

-- AlterTable
ALTER TABLE "episodes" DROP COLUMN "metadataId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "director" TEXT NOT NULL,
ADD COLUMN     "isSaFliixProd" BOOLEAN NOT NULL,
ADD COLUMN     "plateformeDAte" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "releaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "video_metadata" ALTER COLUMN "formatId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "VideoFormat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
