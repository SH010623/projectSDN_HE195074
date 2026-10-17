import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/authService";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
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
      await authApi.register(form);
      navigate("/login", { state: { registered: true } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">🎬</span>
          <h1 className="brand-name">CineMax</h1>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join us and start booking tickets</p>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="field-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="field-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label htmlFor="reg-phone">Phone Number</label>
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

          <div className="field-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button
            id="register-submit"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" id="go-login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
