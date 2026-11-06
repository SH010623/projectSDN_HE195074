const { sendMail } = require("./mail");

exports.sendPasswordResetOtp = async (email, otp) => {
  await sendMail({
    to: email,
    subject: "Mã OTP đặt lại mật khẩu Cinema",
    text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}\nMã có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`,
  });
};
