const express = require("express");
const { register, login, forgotPassword } = require("../controllers/auth.controller");

const router = express.Router();

// POST /register
router.post("/register", register);

// POST /login
router.post("/login", login);

// POST /forgot-password
router.post("/forgot-password", forgotPassword);

module.exports = router;
