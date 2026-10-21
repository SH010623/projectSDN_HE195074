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

      {/* Menu Điều hướng */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          marginTop: "1.5rem",
          maxWidth: "600px",
        }}
      >
        <button
          onClick={() => navigate("/profile")}
          style={{
            padding: "0.8rem 1.4rem",
            background: "#161626",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>👤</span> Hồ sơ cá nhân
        </button>

        {user?.role === "admin" && (
          <>
            <button
              onClick={() => navigate("/admin/users")}
              style={{
                padding: "0.8rem 1.4rem",
                background: "#161626",
                border: "1px solid rgba(99,102,241,0.4)",
                borderRadius: "12px",
                color: "#a5b4fc",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>👥</span> Quản lý tài khoản
            </button>

            <button
              onClick={() => navigate("/admin/rooms")}
              style={{
                padding: "0.8rem 1.4rem",
                background: "#161626",
                border: "1px solid rgba(236,72,153,0.4)",
                borderRadius: "12px",
                color: "#f472b6",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>🏢</span> Quản lý phòng chiếu
            </button>
          </>
        )}
      </div>

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
