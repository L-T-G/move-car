/*
  Warnings:

  - You are about to drop the column `phoneId` on the `QRCodePhoneBinding` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."QRCodePhoneBinding_phoneId_idx";

-- AlterTable
ALTER TABLE "public"."QRCodePhoneBinding" DROP COLUMN "phoneId";

-- CreateIndex
CREATE INDEX "QRCodePhoneBinding_phone_idx" ON "public"."QRCodePhoneBinding"("phone");
