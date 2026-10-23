const express = require("express");
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

// POST /register
router.post("/register", register);

// POST /login
router.post("/login", login);

module.exports = router;
