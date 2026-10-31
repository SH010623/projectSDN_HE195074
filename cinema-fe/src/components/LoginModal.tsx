import { useState, type FormEvent } from "react";
import { authApi } from "../services/authService";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user?: any) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginModal({
  onClose,
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginModalProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onSuccess(res.data.user);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#16172a] border border-white/10 rounded-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          id="modal-close-login"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-[#8888a0] hover:bg-white/10 hover:text-white transition-colors text-sm border-0 cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#f0f0f5] mb-1">Đăng nhập</h2>
        <p className="text-sm text-[#8888a0] leading-relaxed mb-6">
          Đăng nhập để quản lý vé, điểm thưởng và thông tin thành viên của bạn.
        </p>

        <form onSubmit={handleSubmit} id="login-form" className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-medium text-[#8888a8] tracking-wide">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email..."
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#555577] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors font-inter"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-medium text-[#8888a8] tracking-wide">
              Mật khẩu
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Nhập mật khẩu..."
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#555577] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors font-inter"
            />
            <button
              type="button"
              id="forgot-password-btn"
              onClick={onSwitchToForgotPassword}
              className="self-end text-xs font-medium text-[#e8173a] hover:opacity-75 transition-opacity mt-1 bg-transparent border-0 cursor-pointer font-inter"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3 bg-[#e8173a] hover:bg-[#c91131] disabled:opacity-55 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center min-h-[44px] font-inter border-0 cursor-pointer shadow-lg shadow-red-950/40"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#8888a0]">
          Bạn chưa có tài khoản?{" "}
          <button
            id="switch-to-register"
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#e8173a] font-semibold hover:opacity-75 transition-opacity bg-transparent border-0 cursor-pointer font-inter ml-1"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}
