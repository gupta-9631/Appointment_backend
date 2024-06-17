const prisma = require("../../../db/prisma");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

async function createAppointment(req, res) {
  const { user_id, appointment_date, appointment_time, slot_id } = req.body;

  const userId = parseInt(user_id);
  const slotId = parseInt(slot_id);

  try {
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        user_id: userId,
        status: "reserved",
      },
    });

    console.log(existingAppointments, "existingAppointments");

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        message: "You have an existing appointment",
        status: false,
      });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        user_id: userId,
        appointment_date,
        appointment_time,
        status: "reserved",
        slot_id: slotId,
      },
    });

    await prisma.slot.update({
      where: { id: slotId },
      data: {
        availability: "reserved",
        appointmentId: newAppointment.appointment_id,
      },
    });

    return res.status(201).json({
      message: "Appointment successfully booked",
      data: newAppointment,
      status: true,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
}

async function cancelAppointment(req, res) {
  const { appointment_id, slot_id } = req.body;
  console.log(appointment_id, "appointment_id");
  try {
    const cancelAppointment = await prisma.appointment.delete({
      where: { appointment_id: parseInt(appointment_id) },
    });

    await prisma.slot.update({
      where: { id: parseInt(slot_id) },
      data: {
        availability: "available",
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
        user_id: parseInt(user_id),
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

// send Notification by mail

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rahulgupta152107@gmail.com",
    pass: "swmi wccn rosw ajdu",
  },
});

const sendEmailNotification = (userEmail, appointmentTime) => {
  const mailOptions = {
    from: "rahulgupta152107@gmail.com",
    to: userEmail,
    subject: "Appointment Reminder",
    text: `This is a reminder for your appointment scheduled today at ${appointmentTime}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

const calculateTimeDifference = (dateString) => {
  const givenTime = new Date(dateString);
  const currentTime = new Date();

  const millisecondsDiff = givenTime.getTime() - currentTime.getTime();

  const minutesDiff = Math.floor(millisecondsDiff / (1000 * 60));

  return minutesDiff;
};

const sentEmails = new Set();
async function sendMailNotification(req, res) {
  try {
    const checkUsersAppointment = await prisma.appointment.findMany({
      where: {
        status: "reserved",
      },
    });

    for (const appointment of checkUsersAppointment) {
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(appointment.user_id),
        },
      });

      if (user) {
        const timeDifference = calculateTimeDifference(
          appointment.appointment_time
        );

        if (
          timeDifference <= 30 &&
          timeDifference > 0 &&
          !sentEmails.has(appointment.appointment_id)
        ) {
          sendEmailNotification(user.email, appointment.appointment_time);

          sentEmails.add(appointment.appointment_id);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching appointments or users:", error);
  }
}

cron.schedule("* * * * *", () => {
  sendMailNotification();
});

module.exports = {
  getAvailableSlots,
  getBookedAppointments,
  cancelAppointment,
  createAppointment,
  createSlot,
};
