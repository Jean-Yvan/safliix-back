/*
  Warnings:

  - You are about to drop the column `max_shared_accounts` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `video_quality` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - Added the required column `videoQuality` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "max_shared_accounts",
DROP COLUMN "video_quality",
ADD COLUMN     "maxSharedAccounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoQuality" "VideoQuality" NOT NULL;
