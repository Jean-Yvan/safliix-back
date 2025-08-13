-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_categoryid_fkey";

-- DropForeignKey
ALTER TABLE "video_metadata" DROP CONSTRAINT "video_metadata_formatId_fkey";

-- AlterTable
ALTER TABLE "video_metadata" ALTER COLUMN "categoryid" DROP NOT NULL,
ALTER COLUMN "formatId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "VideoFormat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_categoryid_fkey" FOREIGN KEY ("categoryid") REFERENCES "VideoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
