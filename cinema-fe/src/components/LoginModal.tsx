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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" id="modal-close-login" onClick={onClose} aria-label="Dong">
          x
        </button>

        <h2 className="modal-title">Dang nhap</h2>
        <p className="modal-subtitle">
          Dang nhap de quan ly ve, diem thuong va thong tin thanh vien cua ban.
        </p>

        <form onSubmit={handleSubmit} id="login-form" className="modal-form">
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Mat khau</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Mat khau"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button type="button" className="forgot-link" id="forgot-password-btn">
              Quen mat khau?
            </button>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button id="login-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Dang nhap"}
          </button>
        </form>

        <p className="modal-switch">
          Ban chua co tai khoan?{" "}
          <button
            id="switch-to-register"
            type="button"
            className="link-btn"
            onClick={onSwitchToRegister}
          >
            Dang ky
          </button>
        </p>
      </div>
    </div>
  );
}
