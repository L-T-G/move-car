/*
  Warnings:

  - Added the required column `updateAt` to the `Phone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `QRCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `QRCodeBinding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Phone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "Phone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Phone" ("createdAt", "id", "number", "userId") SELECT "createdAt", "id", "number", "userId" FROM "Phone";
DROP TABLE "Phone";
ALTER TABLE "new_Phone" RENAME TO "Phone";
CREATE UNIQUE INDEX "Phone_number_key" ON "Phone"("number");
CREATE TABLE "new_QRCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "ownerId" INTEGER,
    "carPlate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "QRCode_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QRCode" ("carPlate", "code", "createdAt", "id", "imageUrl", "ownerId", "status") SELECT "carPlate", "code", "createdAt", "id", "imageUrl", "ownerId", "status" FROM "QRCode";
DROP TABLE "QRCode";
ALTER TABLE "new_QRCode" RENAME TO "QRCode";
CREATE UNIQUE INDEX "QRCode_code_key" ON "QRCode"("code");
CREATE TABLE "new_QRCodeBinding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "qrcodeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "QRCodeBinding_qrcodeId_fkey" FOREIGN KEY ("qrcodeId") REFERENCES "QRCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QRCodeBinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QRCodeBinding" ("createdAt", "id", "isOwner", "qrcodeId", "userId") SELECT "createdAt", "id", "isOwner", "qrcodeId", "userId" FROM "QRCodeBinding";
DROP TABLE "QRCodeBinding";
ALTER TABLE "new_QRCodeBinding" RENAME TO "QRCodeBinding";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "id") SELECT "createdAt", "id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
