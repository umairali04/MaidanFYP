/*
  Warnings:

  - A unique constraint covering the columns `[matchCode]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "matchCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_matchCode_key" ON "Booking"("matchCode");
