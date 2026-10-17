const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");
const {
  verifyAccessKey,
  userOnly,
  adminOnly,
} = require("../middlewares/verifyAccessKey");

const ApiRouter = express.Router();

// ─── Auth Routes ─────────────────────────────────────────────────────────────

// POST /register  – { email, password, name, phone }
ApiRouter.post("/register", register);

// POST /login     – { email, password }
ApiRouter.post("/login", login);

// ─── Protected Routes ─────────────────────────────────────────────────────────

// GET /protected  – requires Authorization: Bearer <token>
ApiRouter.get("/protected", verifyToken, async (req, res) => {
  res.status(200).json({
    message: "This is a protected route",
    user: {
      userId: req.userId,
      role: req.role,
    },
  });
});

// GET /protected-key  – requires access_key header (user role only)
ApiRouter.get("/protected-key", verifyAccessKey, userOnly, async (req, res) => {
  res.status(200).json({
    message: "This is a protected route (access_key)",
    user: {
      userId: req.userId,
      name: req.user.name,
      role: req.role,
      user: req.user,
    },
  });
});

module.exports = ApiRouter;
