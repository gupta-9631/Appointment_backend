const express = require("express");
require("dotenv").config();
const cors = require("cors");
const userRouter = require("./src/routes/userRoute/userRoutes");
const appointmentRouter = require("./src/routes/appointmentRoute/appointmentRoutes");

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome To Server");
});

app.use("/user", userRouter);
app.use("/appointment", appointmentRouter);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
