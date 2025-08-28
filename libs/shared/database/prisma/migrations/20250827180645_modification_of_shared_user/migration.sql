/*
  Warnings:

  - You are about to drop the column `sharedUserId` on the `SharedAccount` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SharedAccountUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SharedAccount" DROP CONSTRAINT "SharedAccount_sharedUserId_fkey";

-- DropForeignKey
ALTER TABLE "SharedAccountUser" DROP CONSTRAINT "SharedAccountUser_userId_fkey";

-- AlterTable
ALTER TABLE "SharedAccount" DROP COLUMN "sharedUserId";

-- AlterTable
ALTER TABLE "SharedAccountUser" DROP COLUMN "userId";
