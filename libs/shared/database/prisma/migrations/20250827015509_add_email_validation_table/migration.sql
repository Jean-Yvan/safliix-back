-- CreateTable
CREATE TABLE "EmailValidation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailValidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailValidation_token_key" ON "EmailValidation"("token");

-- CreateIndex
CREATE INDEX "EmailValidation_userId_idx" ON "EmailValidation"("userId");

-- AddForeignKey
ALTER TABLE "EmailValidation" ADD CONSTRAINT "EmailValidation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
