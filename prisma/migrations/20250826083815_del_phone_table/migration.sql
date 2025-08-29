/*
  Warnings:

  - You are about to drop the `Phone` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[qrcodeId,phone]` on the table `QRCodePhoneBinding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `QRCodePhoneBinding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."QRCodePhoneBinding" DROP CONSTRAINT "QRCodePhoneBinding_phoneId_fkey";

-- DropIndex
DROP INDEX "public"."QRCodePhoneBinding_qrcodeId_phoneId_key";

-- AlterTable
ALTER TABLE "public"."QRCodePhoneBinding" ADD COLUMN     "phone" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Phone";

-- CreateIndex
CREATE UNIQUE INDEX "QRCodePhoneBinding_qrcodeId_phone_key" ON "public"."QRCodePhoneBinding"("qrcodeId", "phone");
