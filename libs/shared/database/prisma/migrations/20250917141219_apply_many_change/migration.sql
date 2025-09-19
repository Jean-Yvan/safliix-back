/*
  Warnings:

  - The values [MOVIE,EPISODE,AD] on the enum `VideoAttachmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoAttachmentType_new" AS ENUM ('MAIN', 'TRAILER', 'BONUS', 'MAKING_OF', 'CLIP', 'PREVIEW', 'ADVERTISEMENT');
ALTER TABLE "video_attachments" ALTER COLUMN "type" TYPE "VideoAttachmentType_new" USING ("type"::text::"VideoAttachmentType_new");
ALTER TYPE "VideoAttachmentType" RENAME TO "VideoAttachmentType_old";
ALTER TYPE "VideoAttachmentType_new" RENAME TO "VideoAttachmentType";
DROP TYPE "VideoAttachmentType_old";
COMMIT;
