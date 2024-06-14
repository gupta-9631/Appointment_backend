const express = require("express");
const userRoutes = require("../../controllers/userController/userControllers");

const router = express.Router();

router.post("/signin", userRoutes.signIn);
router.post("/register", userRoutes.register);

module.exports = router;
