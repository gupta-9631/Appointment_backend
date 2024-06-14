const express = require("express");
const appointmentRouter = require("../../controllers/appointmentControllers/appointmentController");

const router = express.Router();

router.post("/create", appointmentRouter.createAppointment);
router.post("/cancel", appointmentRouter.cancelAppointment);
router.post("/booked", appointmentRouter.getBookedAppointments);
router.post("/createSlot", appointmentRouter.createSlot);
router.get("/available", appointmentRouter.getAvailableSlots);

module.exports = router;
