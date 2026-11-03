const nodemailer = require("nodemailer");

exports.sendPasswordResetOtp = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP is not configured");
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "Mã OTP đặt lại mật khẩu Cinema",
    text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}\nMã có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`,
  });
};
