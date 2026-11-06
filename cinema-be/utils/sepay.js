const crypto = require("node:crypto");

function getConfig() {
  const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER?.trim();
  const bank = process.env.SEPAY_BANK?.trim();
  const apiKey = process.env.SEPAY_WEBHOOK_API_KEY?.trim();
  if (!accountNumber || !bank || !apiKey) {
    const error = new Error("Chưa cấu hình thanh toán SePay. Vui lòng liên hệ quản trị viên.");
    error.status = 503;
    throw error;
  }
  return { accountNumber, bank, apiKey, accountName: process.env.SEPAY_ACCOUNT_NAME || "" };
}

function validAuthorization(header, apiKey) {
  const actual = Buffer.from(typeof header === "string" ? header : "");
  const expected = Buffer.from(`Apikey ${apiKey}`);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function paymentDetails(booking) {
  if (booking.paymentMethod !== "sepay" || booking.status !== "pending") return null;
  const { accountNumber, bank, accountName } = getConfig();
  const params = new URLSearchParams({ acc: accountNumber, bank,
    amount: String(booking.finalPrice), des: booking.bookingCode, template: "compact" });
  return { accountNumber, bank, accountName, amount: booking.finalPrice,
    content: booking.bookingCode, expiresAt: booking.expiresAt,
    qrUrl: `https://vietqr.app/img?${params}` };
}

// Payment codes contain only letters and numbers so bank memos preserve them.
function extractBookingCode(payload) {
  const text = `${typeof payload.code === "string" ? payload.code : ""} ${typeof payload.content === "string" ? payload.content : ""}`.toUpperCase();
  const codes = [...new Set(text.match(/\bNCC[0-9A-F]{16}\b/g) || [])];
  return codes.length === 1 ? codes[0] : null;
}

module.exports = { getConfig, validAuthorization, paymentDetails, extractBookingCode };
