import { useState, type FormEvent } from "react";
import { authApi } from "../services/authService";

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const inputCls =
  "px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] text-sm placeholder-[#3a3a5a] outline-none focus:border-[#e8173a]/50 focus:bg-[#e8173a]/[0.04] transition-colors w-full";

export default function RegisterModal({ onClose, onSwitchToLogin }: RegisterModalProps) {
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      await authApi.register(form);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Dang ky that bai. Vui long thu lai.";
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
          id="modal-close-register"
          onClick={onClose}
          aria-label="Dong"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-[#8888a0] hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          x
        </button>

        {success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#e8173a" strokeWidth="1.5" />
                <path d="M7 12.5l3.5 3.5L17 9" stroke="#e8173a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Dang ky thanh cong!</h2>
            <p className="text-sm text-[#6060a0] leading-relaxed">
              Tai khoan cua ban da duoc tao. Hay dang nhap de tiep tuc.
            </p>
            <button
              id="go-login-after-register"
              onClick={onSwitchToLogin}
              className="mt-3 w-full py-3 bg-[#e8173a] hover:bg-[#c91131] rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Dang nhap ngay
            </button>
          </div>
        ) : (
          /* ── Register form ── */
          <>
            <h2 className="text-2xl font-bold text-[#f0f0f5] mb-1">Dang ky</h2>
            <p className="text-sm text-[#6060a0] leading-relaxed mb-6">
              Tao tai khoan de dat ve, tich diem va nhan uu dai doc quyen.
            </p>

            <form onSubmit={handleSubmit} id="register-form" className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-name" className="text-xs font-medium text-[#8888a8]">Ho ten</label>
                <input id="reg-name" type="text" name="name" placeholder="Ho ten"
                  value={form.name} onChange={handleChange} required autoComplete="name"
                  className={inputCls} />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="text-xs font-medium text-[#8888a8]">Email</label>
                <input id="reg-email" type="email" name="email" placeholder="Email"
                  value={form.email} onChange={handleChange} required autoComplete="email"
                  className={inputCls} />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-phone" className="text-xs font-medium text-[#8888a8]">So dien thoai</label>
                <input id="reg-phone" type="tel" name="phone" placeholder="0912 345 678"
                  value={form.phone} onChange={handleChange} required autoComplete="tel"
                  className={inputCls} />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-password" className="text-xs font-medium text-[#8888a8]">Mat khau</label>
                <input id="reg-password" type="password" name="password" placeholder="Mat khau"
                  value={form.password} onChange={handleChange} required autoComplete="new-password"
                  className={inputCls} />
              </div>

              {/* Error */}
              {error && (
                <p role="alert" className="text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3 bg-[#e8173a] hover:bg-[#c91131] disabled:opacity-55 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center min-h-[44px]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Dang ky"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#5a5a7a]">
              Da co tai khoan?{" "}
              <button
                id="switch-to-login"
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#e8173a] font-semibold hover:opacity-75 transition-opacity bg-transparent border-0 cursor-pointer"
              >
                Dang nhap
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
