import { useState, type FormEvent } from "react";
import { authApi } from "../services/authService";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ onClose, onSuccess, onSwitchToRegister }: LoginModalProps) {
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
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Dang nhap that bai. Vui long thu lai.";
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
        className="relative w-full max-w-md bg-[#16172a] border border-white/8 rounded-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          id="modal-close-login"
          onClick={onClose}
          aria-label="Dong"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-[#8888a0] hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          x
        </button>

        <h2 className="text-2xl font-bold text-[#f0f0f5] mb-1">Dang nhap</h2>
        <p className="text-sm text-[#6060a0] leading-relaxed mb-6">
          Dang nhap de quan ly ve, diem thuong va thong tin thanh vien cua ban.
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
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#3a3a5a] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors font-inter"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-medium text-[#8888a8] tracking-wide">
              Mat khau
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Mat khau"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#3a3a5a] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors font-inter"
            />
            <button
              type="button"
              id="forgot-password-btn"
              className="self-end text-xs font-medium text-[#e8173a] hover:opacity-75 transition-opacity mt-0.5 bg-transparent border-0 cursor-pointer font-inter"
            >
              Quen mat khau?
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
            className="mt-1 w-full py-3 bg-[#e8173a] hover:bg-[#c91131] disabled:opacity-55 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center min-h-[44px] font-inter"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Dang nhap"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#5a5a7a]">
          Ban chua co tai khoan?{" "}
          <button
            id="switch-to-register"
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#e8173a] font-semibold hover:opacity-75 transition-opacity bg-transparent border-0 cursor-pointer font-inter"
          >
            Dang ky
          </button>
        </p>
      </div>
    </div>
  );
}
