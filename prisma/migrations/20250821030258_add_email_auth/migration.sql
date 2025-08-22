/*
  Warnings:

  - You are about to drop the column `userId` on the `Phone` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `QRCode` table. All the data in the column will be lost.
  - The `status` column on the `QRCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `updateAt` on the `QRCodeBinding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrcodeId,userId]` on the table `QRCodeBinding` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."QRCodeStatus" AS ENUM ('available', 'bound', 'disabled');

-- DropForeignKey
ALTER TABLE "public"."Phone" DROP CONSTRAINT "Phone_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Phone" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."QRCode" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."QRCodeStatus" NOT NULL DEFAULT 'available';

-- AlterTable
ALTER TABLE "public"."QRCodeBinding" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."QRCodePhoneBinding" (
    "id" SERIAL NOT NULL,
    "qrcodeId" INTEGER NOT NULL,
    "phoneId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "QRCodePhoneBinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QRCodePhoneBinding_qrcodeId_idx" ON "public"."QRCodePhoneBinding"("qrcodeId");

-- CreateIndex
CREATE INDEX "QRCodePhoneBinding_phoneId_idx" ON "public"."QRCodePhoneBinding"("phoneId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodePhoneBinding_qrcodeId_phoneId_key" ON "public"."QRCodePhoneBinding"("qrcodeId", "phoneId");

-- CreateIndex
CREATE INDEX "Phone_number_idx" ON "public"."Phone"("number");

-- CreateIndex
CREATE INDEX "QRCode_status_createdAt_idx" ON "public"."QRCode"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QRCodeBinding_userId_idx" ON "public"."QRCodeBinding"("userId");

-- CreateIndex
CREATE INDEX "QRCodeBinding_qrcodeId_idx" ON "public"."QRCodeBinding"("qrcodeId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodeBinding_qrcodeId_userId_key" ON "public"."QRCodeBinding"("qrcodeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."QRCodePhoneBinding" ADD CONSTRAINT "QRCodePhoneBinding_qrcodeId_fkey" FOREIGN KEY ("qrcodeId") REFERENCES "public"."QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QRCodePhoneBinding" ADD CONSTRAINT "QRCodePhoneBinding_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "public"."Phone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
