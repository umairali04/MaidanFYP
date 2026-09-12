-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentDeadline" TIMESTAMP(3),
ADD COLUMN     "paymentReminderSentAt" TIMESTAMP(3);
