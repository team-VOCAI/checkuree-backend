/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `USERS` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "USERS" ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "USERS_refreshToken_key" ON "USERS"("refreshToken");
