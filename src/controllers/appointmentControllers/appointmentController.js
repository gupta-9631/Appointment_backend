const bcrypt = require("bcrypt");
const prisma = require("../../../db/prisma");

async function createAppointment(req, res) {
  const { user_id, appointment_date, appointment_time, slot_id } = req.body;
  try {
    const newAppointment = await prisma.appointment.create({
      data: {
        user_id: parseInt(user_id),
        appointment_date,
        appointment_time,
        status: "reserved",
      },
    });

    await prisma.slot.update({
      where: { id: parseInt(slot_id) },
      data: { availability: "reserved" },
    });

    return res.status(201).json({
      message: "Appointment successfully booked",
      data: newAppointment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function cancelAppointment(req, res) {
  const { appointment_id } = req.body;
  try {
    const newAppointment = await prisma.appointment.update({
      where: { appointment_id: parseInt(appointment_id) },
      data: {
        status: "canceled",
      },
    });

    await prisma.slot.update({
      where: { appointmentId: appointment_id },
      data: {
        availability: "canceled",
      },
    });

    return res.status(200).json({ message: "Reservation cancelled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getBookedAppointments(req, res) {
  const { user_id } = req.body;
  try {
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        user_id,
        status: "reserved",
      },
    });

    return res.status(200).json({
      data: bookedAppointments,
      message: "Appointments retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createSlot(req, res) {
  const { end_time, start_time } = req.body;
  try {
    const newSlot = await prisma.slot.create({
      data: {
        start_time,
        end_time,
        availability: "available",
      },
    });

    return res.status(201).json({
      message: "Slot created successfully",
      data: newSlot,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAvailableSlots(req, res) {
  try {
    const availableSlots = await prisma.slot.findMany({
      where: {
        availability: "available",
      },
    });

    return res.status(200).json({
      data: availableSlots,
      message: "Slots retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAvailableSlots,
  getBookedAppointments,
  cancelAppointment,
  createAppointment,
  createSlot,
};
