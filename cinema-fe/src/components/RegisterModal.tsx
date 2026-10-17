import { useState, type FormEvent } from "react";
import { authApi } from "../services/authService";

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

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

  if (success) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Dong">
            x
          </button>
          <div className="modal-success">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#e8173a" strokeWidth="1.5" />
                <path
                  d="M7 12.5l3.5 3.5L17 9"
                  stroke="#e8173a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="modal-title">Dang ky thanh cong!</h2>
            <p className="modal-subtitle">Tai khoan cua ban da duoc tao. Hay dang nhap de tiep tuc.</p>
            <button className="btn-primary" id="go-login-after-register" onClick={onSwitchToLogin}>
              Dang nhap ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" id="modal-close-register" onClick={onClose} aria-label="Dong">
          x
        </button>

        <h2 className="modal-title">Dang ky</h2>
        <p className="modal-subtitle">
          Tao tai khoan de dat ve, tich diem va nhan uu dai doc quyen.
        </p>

        <form onSubmit={handleSubmit} id="register-form" className="modal-form">
          <div className="form-field">
            <label htmlFor="reg-name">Ho ten</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="Ho ten"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-phone">So dien thoai</label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              placeholder="0912 345 678"
              value={form.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-password">Mat khau</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="Mat khau"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button id="register-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Dang ky"}
          </button>
        </form>

        <p className="modal-switch">
          Da co tai khoan?{" "}
          <button
            id="switch-to-login"
            type="button"
            className="link-btn"
            onClick={onSwitchToLogin}
          >
            Dang nhap
          </button>
        </p>
      </div>
    </div>
  );
}
