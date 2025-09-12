-- CreateEnum
CREATE TYPE "VideoFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED', 'CANCELLED', 'QUEUED');

-- AlterTable
ALTER TABLE "video_files" ADD COLUMN     "status" "VideoFileStatus" NOT NULL DEFAULT 'PENDING';
