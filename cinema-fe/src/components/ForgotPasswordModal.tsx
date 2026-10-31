import { useState, type FormEvent } from "react";
import { authApi } from "../services/authService";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordModal({
  onClose,
  onSwitchToLogin,
}: ForgotPasswordModalProps) {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.email.trim() || !form.phone.trim() || !form.newPassword) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword({
        email: form.email.trim(),
        phone: form.phone.trim(),
        newPassword: form.newPassword,
      });

      setSuccessMsg(res.data.message || "Đặt lại mật khẩu thành công!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại thông tin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-inter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#16172a] border border-white/10 rounded-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="modal-close-forgot"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-[#8888a0] hover:bg-white/10 hover:text-white transition-colors text-sm border-0 cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#f0f0f5] mb-1">Quên mật khẩu</h2>
        <p className="text-sm text-[#8888a0] leading-relaxed mb-6">
          Xác minh Email và Số điện thoại đã đăng ký để tạo mật khẩu mới cho tài khoản.
        </p>

        {successMsg ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center text-2xl mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Thành công!</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              {successMsg}
            </p>
            <button
              onClick={onSwitchToLogin}
              className="w-full py-3 bg-[#e8173a] hover:bg-[#c91131] rounded-xl text-white text-sm font-semibold transition-colors border-0 cursor-pointer shadow-lg shadow-red-950/40"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="forgot-password-form" className="flex flex-col gap-3.5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-email" className="text-xs font-medium text-[#8888a8] tracking-wide">
                Email đăng ký (*)
              </label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email..."
                value={form.email}
                onChange={handleChange}
                required
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#555577] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-phone" className="text-xs font-medium text-[#8888a8] tracking-wide">
                Số điện thoại đăng ký (*)
              </label>
              <input
                id="forgot-phone"
                type="tel"
                name="phone"
                placeholder="Nhập số điện thoại đã đăng ký..."
                value={form.phone}
                onChange={handleChange}
                required
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#555577] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-new-password" className="text-xs font-medium text-[#8888a8] tracking-wide">
                Mật khẩu mới (*)
              </label>
              <input
                id="forgot-new-password"
                type="password"
                name="newPassword"
                placeholder="Tối thiểu 6 ký tự..."
                value={form.newPassword}
                onChange={handleChange}
                required
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#555577] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-confirm-password" className="text-xs font-medium text-[#8888a8] tracking-wide">
                Xác nhận mật khẩu mới (*)
              </label>
              <input
                id="forgot-confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới..."
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#555577] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p role="alert" className="text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg px-3 py-2 mt-1">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              id="forgot-submit"
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-[#e8173a] hover:bg-[#c91131] disabled:opacity-55 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center min-h-[44px] border-0 cursor-pointer shadow-lg shadow-red-950/40"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>

            {/* Back to Login */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs text-[#8888a0] hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                ← Quay lại Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

