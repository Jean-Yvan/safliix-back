/*
  Warnings:

  - You are about to drop the column `isPremiere` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `isPremiere` on the `series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "isPremiere",
ADD COLUMN     "seasonCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'location',
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "series" DROP COLUMN "isPremiere",
ADD COLUMN     "seasonCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'location';
