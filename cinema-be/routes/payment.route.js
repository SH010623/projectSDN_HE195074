const router = require("express").Router();
const { sepayWebhook, getTransactions } = require("../controllers/payment.controller");
const { verifyToken, adminOnly } = require("../middlewares/verifyToken");

// SePay uses its own API Key, not a customer's JWT.
router.post("/sepay/webhook", sepayWebhook);
router.get("/admin/transactions", verifyToken, adminOnly, getTransactions);
module.exports = router;
