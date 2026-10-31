import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";

interface SidebarCounts {
  movies: number;
  showtimes: number;
  rooms: number;
  users: number;
  vouchers: number;
}

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const [counts, setCounts] = useState<SidebarCounts>({
    movies: 0,
    showtimes: 0,
    rooms: 0,
    users: 0,
    vouchers: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const stats = await dashboardService.getStats();
      if (stats?.kpi) {
        setCounts({
          movies: stats.kpi.totalMovies || 0,
          showtimes: stats.kpi.totalShowtimes || 0,
          rooms: stats.kpi.activeRooms || 0,
          users: stats.kpi.totalUsers || 0,
          vouchers: stats.kpi.activeVouchers || 0,
        });
      }
    } catch {
      // Fallback defaults if stats fail
      setCounts({
        movies: 12,
        showtimes: 28,
        rooms: 4,
        users: 48,
        vouchers: 6,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isItemActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return currentPath === "/admin/dashboard" || currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: "📊",
      path: "/admin/dashboard",
      badge: "Overview",
      badgeColor: "bg-indigo-500/15 text-indigo-400",
    },
    {
      label: "Quản lý phim",
      icon: "🎬",
      path: "/admin/movies",
      badge: counts.movies > 0 ? String(counts.movies) : undefined,
      badgeColor: "bg-rose-500/15 text-rose-400",
    },
    {
      label: "Lịch chiếu phim",
      icon: "🕒",
      path: "/admin/showtimes",
      badge: counts.showtimes > 0 ? String(counts.showtimes) : undefined,
      badgeColor: "bg-amber-500/15 text-amber-400",
    },
    {
      label: "Phòng chiếu",
      icon: "🏛️",
      path: "/admin/rooms",
      badge: counts.rooms > 0 ? String(counts.rooms) : undefined,
      badgeColor: "bg-pink-500/15 text-pink-400",
    },
    {
      label: "Người dùng",
      icon: "👥",
      path: "/admin/users",
      badge: counts.users > 0 ? String(counts.users) : undefined,
      badgeColor: "bg-indigo-500/15 text-indigo-400",
    },
    {
      label: "Voucher ưu đãi",
      icon: "🏷️",
      path: "/admin/vouchers",
      badge: counts.vouchers > 0 ? String(counts.vouchers) : undefined,
      badgeColor: "bg-emerald-500/15 text-emerald-400",
    },
    {
      label: "Tin tức rạp",
      icon: "📰",
      path: "/admin/news",
      badge: "News",
      badgeColor: "bg-cyan-500/15 text-cyan-400",
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#111229] border-r border-white/[0.08] flex flex-col shrink-0 md:sticky md:top-0 md:h-screen z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.08] gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e8173a] to-[#ff4767] flex items-center justify-center shadow-lg shadow-[#e8173a]/30 shrink-0">
          <span className="text-white font-extrabold text-base tracking-wider">NCC</span>
        </div>
        <div className="min-w-0">
          <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 truncate">
            CONCEPT <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e8173a]/20 text-[#f87083] font-bold shrink-0">ADMIN</span>
          </div>
          <div className="text-[11px] text-[#8888a6] leading-none mt-0.5 truncate">Cinema Management</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-5 px-3 flex flex-col gap-6 overflow-y-auto">
        {/* Main Menu */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#717392] mb-2">
            MENU
          </div>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const active = isItemActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer border-0 text-left ${
                    active
                      ? "text-white font-bold bg-gradient-to-r from-[#e8173a]/25 to-transparent border-l-4 border-[#e8173a] shadow-inner shadow-[#e8173a]/10"
                      : "text-[#9fa2c4] font-medium hover:text-white hover:bg-white/[0.05] bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        active ? "bg-[#e8173a]/30 text-white font-bold" : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick System Access */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#717392] mb-2">
            HỆ THỐNG
          </div>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9fa2c4] hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer border-0 bg-transparent text-left"
            >
              <span className="text-base shrink-0">🌐</span>
              <span className="truncate">Xem Website khách</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-0 text-left ${
                currentPath === "/profile"
                  ? "text-white font-bold bg-gradient-to-r from-[#e8173a]/25 to-transparent border-l-4 border-[#e8173a]"
                  : "text-[#9fa2c4] hover:text-white hover:bg-white/[0.05] bg-transparent"
              }`}
            >
              <span className="text-base shrink-0">👤</span>
              <span className="truncate">Hồ sơ Admin</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer (Profile & Logout) */}
      <div className="p-4 border-t border-white/[0.08] bg-[#0e0f22] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0e0f22]" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-semibold text-white truncate max-w-[110px]" title={user?.name}>
              {user?.name || "Admin"}
            </span>
            <span className="text-[11px] text-[#f87083] font-medium">Quản trị viên</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#a0a0c0] hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer border-0 shrink-0"
        >
          🚪
        </button>
      </div>
    </aside>
  );
}

