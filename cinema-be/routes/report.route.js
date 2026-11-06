const express = require("express");
const { getReportAnalytics } = require("../controllers/report.controller");
const { verifyToken, adminOnly } = require("../middlewares/verifyToken");

const router = express.Router();

// Tất cả route báo cáo thống kê đều yêu cầu đăng nhập và có quyền Admin
router.use(verifyToken, adminOnly);

// GET /admin/reports/analytics – Báo cáo tổng hợp số liệu
router.get("/analytics", getReportAnalytics);

module.exports = router;

