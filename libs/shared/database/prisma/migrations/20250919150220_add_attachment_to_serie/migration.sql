-- AlterTable
ALTER TABLE "MediaAttachment" ADD COLUMN     "serieId" TEXT;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
