import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f1a",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        gap: "1rem",
      }}
    >
      <span style={{ fontSize: "3rem" }}>🎬</span>
      <h1 style={{ fontSize: "2rem", margin: 0 }}>Welcome, {user?.name ?? "Guest"}!</h1>
      <p style={{ color: "#a0a0b0" }}>{user?.email}</p>
      <p
        style={{
          background: "rgba(139,92,246,0.15)",
          border: "1px solid rgba(139,92,246,0.4)",
          borderRadius: "999px",
          padding: "0.25rem 1rem",
          fontSize: "0.85rem",
          color: "#c4b5fd",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {user?.role}
      </p>
      <button
        id="logout-btn"
        onClick={handleLogout}
        style={{
          marginTop: "1.5rem",
          padding: "0.65rem 2rem",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          border: "none",
          borderRadius: "12px",
          color: "#fff",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
