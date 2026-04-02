/*
  Warnings:

  - You are about to drop the column `name` on the `ClassSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `StudioBooking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `ClassSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genre` to the `ClassSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `ClassSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ClassSlot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClassLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "ClassBooking" ADD COLUMN     "overrideInstructorId" TEXT;

-- AlterTable
ALTER TABLE "ClassSlot" DROP COLUMN "name",
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "genre" TEXT NOT NULL,
ADD COLUMN     "level" "ClassLevel" NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "StudioBooking" ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StudioBooking_stripeSessionId_key" ON "StudioBooking"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_overrideInstructorId_fkey" FOREIGN KEY ("overrideInstructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
