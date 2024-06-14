-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('available', 'reserved', 'canceled');

-- CreateEnum
CREATE TYPE "SlotAvailability" AS ENUM ('available', 'reserved', 'canceled');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "appointment_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "appointment_time" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'available',

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "availability" "SlotAvailability" NOT NULL,
    "appointmentId" INTEGER,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("appointment_id") ON DELETE SET NULL ON UPDATE CASCADE;
