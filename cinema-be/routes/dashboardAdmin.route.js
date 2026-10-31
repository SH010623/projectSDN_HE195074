const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardAdmin.controller");
const { verifyToken, adminOnly } = require("../middlewares/verifyToken");

const router = express.Router();

// GET /admin/dashboard/stats – Yêu cầu quyền admin
router.get("/stats", verifyToken, adminOnly, getDashboardStats);

module.exports = router;

