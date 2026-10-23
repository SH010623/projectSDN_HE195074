import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center font-inter gap-4">
      <div className="w-16 h-16 bg-[#e8173a] flex items-center justify-center rounded-2xl mb-2">
        <span className="text-white font-extrabold text-2xl">N</span>
      </div>
      <h1 className="text-3xl font-extrabold text-white">
        Chao mung, {user?.name ?? "Guest"}!
      </h1>
      <p className="text-[#a0a0b0] text-sm">{user?.email}</p>
      <span className="px-4 py-1 bg-[#e8173a]/15 border border-[#e8173a]/40 rounded-full text-xs font-semibold text-[#f87083] uppercase tracking-widest">
        {user?.role}
      </span>

      {/* Menu Điều hướng */}
      <div className="flex flex-wrap gap-4 justify-center mt-6 max-w-[600px]">
        <button
          onClick={() => navigate("/profile")}
          className="px-5 py-3 bg-[#161626] border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-semibold cursor-pointer flex items-center gap-2 transition-colors"
        >
          <span>👤</span> Hồ sơ cá nhân
        </button>

        {user?.role === "admin" && (
          <>
            <button
              onClick={() => navigate("/admin/users")}
              className="px-5 py-3 bg-[#161626] border border-indigo-500/40 hover:border-indigo-500/70 rounded-xl text-indigo-300 text-sm font-semibold cursor-pointer flex items-center gap-2 transition-colors"
            >
              <span>👥</span> Quản lý tài khoản
            </button>

            <button
              onClick={() => navigate("/admin/rooms")}
              className="px-5 py-3 bg-[#161626] border border-pink-500/40 hover:border-pink-500/70 rounded-xl text-pink-300 text-sm font-semibold cursor-pointer flex items-center gap-2 transition-colors"
            >
              <span>🏢</span> Quản lý phòng chiếu
            </button>
          </>
        )}
      </div>
      <button
        id="logout-btn"
        onClick={handleLogout}
        className="mt-6 px-8 py-2.5 bg-[#e8173a] hover:bg-[#c91131] border-0 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors"
      >
        Dang xuat
      </button>
    </div>
  );
}
