/*
  Warnings:

  - You are about to drop the column `isActive` on the `SharedAccount` table. All the data in the column will be lost.
  - You are about to drop the column `sharedOn` on the `SharedAccount` table. All the data in the column will be lost.
  - Added the required column `pinCode` to the `SharedAccountUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SharedAccount" DROP COLUMN "isActive",
DROP COLUMN "sharedOn";

-- AlterTable
ALTER TABLE "SharedAccountUser" DROP COLUMN "pinCode",
ADD COLUMN     "pinCode" INTEGER NOT NULL;
