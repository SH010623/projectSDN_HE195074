import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";
import type { DashboardStatsResponse } from "../services/dashboardService";

// Helper: Format VNĐ currency
const formatVND = (num: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num || 0);

// Helper: Render smooth Bezier curve SVG path
function generateBezierSvg(data: number[], width: number, height: number, padding = 8) {
  if (!data || data.length === 0) return { linePath: "", areaPath: "" };
  if (data.length === 1) data = [data[0], data[0]];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  // Build cubic Bezier curve
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const linePath = d;
  const areaPath = `${d} L ${width} ${height} L 0 ${height} Z`;

  return { linePath, areaPath };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [hoveredWeekDay, setHoveredWeekDay] = useState<number | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStats();
      setStats(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // If user is a regular customer, show member ticket portal
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0d14] text-[#f0f0f5] font-inter flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#16162a] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#e8173a] flex items-center justify-center rounded-2xl mx-auto mb-4 shadow-lg shadow-[#e8173a]/30">
            <span className="text-white font-black text-2xl">NCC</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Xin chào, {user?.name || "Khách hàng"}!</h2>
          <p className="text-sm text-[#8888a0] mb-6">{user?.email}</p>

          <div className="inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 mb-6">
            Thành viên rạp chiếu phim
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/my-tickets")}
              className="w-full py-3 bg-[#e8173a] hover:bg-[#c91131] rounded-xl text-white font-semibold text-sm transition-colors cursor-pointer border-0 shadow-lg shadow-[#e8173a]/25"
            >
              🎟️ Vé của tôi (My Tickets)
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium text-sm transition-colors cursor-pointer"
            >
              🎬 Trang chủ & Đặt vé xem phim
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium text-sm transition-colors cursor-pointer"
            >
              👤 Hồ sơ cá nhân
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 font-medium text-sm transition-colors cursor-pointer mt-2"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / mock metrics if DB empty
  const kpi = stats?.kpi || {
    totalRevenue: 24850000,
    confirmedBookingsCount: 184,
    totalSeatsSold: 320,
    refundedRevenue: 0,
    refundedCount: 0,
    avgOrderValue: 135000,
    totalUsers: 48,
    totalMovies: 12,
    nowShowingMovies: 8,
    totalRooms: 4,
    activeRooms: 4,
    totalShowtimes: 28,
    activeVouchers: 6,
    revenueGrowth: "+14.8%",
    bookingsGrowth: "+8.2%",
    avgGrowth: "-1.5%",
  };

  const sparklines = stats?.sparklines || {
    revenue: [12, 18, 14, 22, 19, 28, 35],
    bookings: [15, 22, 18, 25, 20, 30, 42],
    refunds: [0, 0, 0, 0, 0, 0, 0],
    avgOrder: [25, 27, 26, 29, 28, 32, 30],
  };

  const weeklyRevenue = stats?.weeklyRevenue || [
    { day: "T2", date: "25/10", revenue: 2100000, tickets: 24 },
    { day: "T3", date: "26/10", revenue: 2850000, tickets: 32 },
    { day: "T4", date: "27/10", revenue: 1950000, tickets: 22 },
    { day: "T5", date: "28/10", revenue: 3400000, tickets: 38 },
    { day: "T6", date: "29/10", revenue: 4900000, tickets: 56 },
    { day: "T7", date: "30/10", revenue: 6200000, tickets: 72 },
    { day: "CN", date: "31/10", revenue: 5800000, tickets: 68 },
  ];

  const recentBookings = stats?.recentBookings || [];
  const topMovies = stats?.topMovies || [];

  // Filter recent bookings
  const filteredBookings = recentBookings.filter((b) => {
    if (!tableSearch.trim()) return true;
    const term = tableSearch.toLowerCase();
    const movieTitle = b.showtimeId?.movieId?.title?.toLowerCase() || "";
    const code = b.bookingCode?.toLowerCase() || "";
    const userName = b.userId?.name?.toLowerCase() || "";
    return movieTitle.includes(term) || code.includes(term) || userName.includes(term);
  });

  // Generate sparkline SVG paths
  const revCurves = generateBezierSvg(sparklines.revenue, 260, 60);
  const bookCurves = generateBezierSvg(sparklines.bookings, 260, 60);
  const refCurves = generateBezierSvg(sparklines.refunds, 260, 60);
  const avgCurves = generateBezierSvg(sparklines.avgOrder, 260, 60);

  // Generate dual-curve SVG for Weekly Acquisition Chart
  const weeklyRevVals = weeklyRevenue.map((w) => w.revenue);
  const weeklyTicketVals = weeklyRevenue.map((w) => w.tickets * 80000);
  const chartW = 340;
  const chartH = 170;
  const weekRevCurve = generateBezierSvg(weeklyRevVals, chartW, chartH, 16);
  const weekTicketCurve = generateBezierSvg(weeklyTicketVals, chartW, chartH, 16);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d1c]">
      {/* Top Navbar */}
      <header className="h-16 bg-[#111229]/80 backdrop-blur-md border-b border-white/[0.08] px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">E-commerce Cinema Dashboard</h1>
          <div className="text-xs text-[#8083a3] flex items-center gap-1.5">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-[#c0c3e0]">Cinema Overview Template</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#c0c3e0] hover:text-white transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>Làm mới</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hệ thống hoạt động ổn định</span>
          </div>
        </div>
      </header>

      {/* Dashboard Body Container */}
      <div className="p-6 flex flex-col gap-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={fetchDashboardStats}
              className="text-xs underline text-rose-200 hover:text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ROW 1: 4 KPI METRIC CARDS WITH INTEGRATED SPARKLINE CURVES
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: Total Revenue */}
          <div className="relative bg-[#141530] border border-white/[0.08] rounded-2xl p-5 overflow-hidden shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ea8]">
                  Total Revenue
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                  ↑ {kpi.revenueGrowth || "+14.8%"}
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {formatVND(kpi.totalRevenue)}
              </div>
            </div>

            {/* Sparkline curve */}
            <div className="mt-4 -mx-5 -mb-5 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 260 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={revCurves.areaPath} fill="url(#revGrad)" />
                <path d={revCurves.linePath} fill="none" stroke="#818cf8" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* CARD 2: Total Bookings / Tickets */}
          <div className="relative bg-[#141530] border border-white/[0.08] rounded-2xl p-5 overflow-hidden shadow-lg hover:border-rose-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ea8]">
                  Tickets Sold
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                  ↑ {kpi.bookingsGrowth || "+8.2%"}
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {kpi.totalSeatsSold} <span className="text-sm font-semibold text-[#8b8ea8]">vé ({kpi.confirmedBookingsCount} đơn)</span>
              </div>
            </div>

            {/* Sparkline curve */}
            <div className="mt-4 -mx-5 -mb-5 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 260 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={bookCurves.areaPath} fill="url(#bookGrad)" />
                <path d={bookCurves.linePath} fill="none" stroke="#fb7185" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* CARD 3: Refunds */}
          <div className="relative bg-[#141530] border border-white/[0.08] rounded-2xl p-5 overflow-hidden shadow-lg hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ea8]">
                  Refunds
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 text-xs font-bold">
                  {kpi.refundedCount} lượt
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {formatVND(kpi.refundedRevenue)}
              </div>
            </div>

            {/* Sparkline curve */}
            <div className="mt-4 -mx-5 -mb-5 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 260 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={refCurves.areaPath} fill="url(#refGrad)" />
                <path d={refCurves.linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* CARD 4: Avg. Revenue Per Order */}
          <div className="relative bg-[#141530] border border-white/[0.08] rounded-2xl p-5 overflow-hidden shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ea8]">
                  Avg. Revenue Per Order
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 text-xs font-bold">
                  {kpi.avgGrowth || "-1.5%"}
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {formatVND(kpi.avgOrderValue)}
              </div>
            </div>

            {/* Sparkline curve */}
            <div className="mt-4 -mx-5 -mb-5 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 260 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={avgCurves.areaPath} fill="url(#avgGrad)" />
                <path d={avgCurves.linePath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 2: RECENT ORDERS (68%) + CUSTOMER ACQUISITION CHART (32%)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Recent Orders Table */}
          <div className="lg:col-span-8 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Recent Orders (Đơn đặt vé gần đây)</h2>
                <p className="text-xs text-[#8083a3]">Danh sách giao dịch đặt vé trực tiếp qua hệ thống</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tìm mã vé, tên phim..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-[#606385] outline-none focus:border-[#e8173a]/50 transition-colors"
                />
                <button
                  onClick={() => navigate("/admin/showtimes")}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#a0a3c2] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#8083a3] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-3">Phim</th>
                    <th className="py-3 px-3">Mã đơn</th>
                    <th className="py-3 px-3">Phòng & Ghế</th>
                    <th className="py-3 px-3">Giá tiền</th>
                    <th className="py-3 px-3">Thời gian</th>
                    <th className="py-3 px-3">Khách hàng</th>
                    <th className="py-3 px-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-[#8083a3]">
                        Không có đơn đặt vé nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b, idx) => {
                      const movie = b.showtimeId?.movieId;
                      const room = b.showtimeId?.roomId;
                      const userObj = b.userId;
                      const isConfirmed = b.status === "confirmed";

                      return (
                        <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-2 text-[#707393] font-medium">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5 min-w-[150px]">
                              <img
                                src={movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&q=80"}
                                alt={movie?.title}
                                className="w-8 h-11 object-cover rounded-md bg-white/5 shrink-0"
                              />
                              <div className="leading-tight truncate max-w-[120px]">
                                <div className="font-semibold text-white truncate" title={movie?.title}>
                                  {movie?.title || "Phim rạp"}
                                </div>
                                <span className="text-[10px] text-amber-400 font-bold">{movie?.rating || "P"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                            {b.bookingCode}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="text-white font-medium">{room?.name || "Rạp"}</div>
                            <div className="text-[10px] text-[#8083a3] font-mono">
                              [{b.seats?.join(", ") || "Ghế"}]
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                            {formatVND(b.finalPrice)}
                          </td>
                          <td className="py-3 px-3 text-[#9fa2c4] whitespace-nowrap text-[11px]">
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Vừa xong"}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="text-white font-medium truncate max-w-[110px]" title={userObj?.name}>
                              {userObj?.name || "Khách"}
                            </div>
                            <div className="text-[10px] text-[#8083a3] truncate max-w-[110px]">
                              {userObj?.phone || userObj?.email || "—"}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isConfirmed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Delivered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                Refunded
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Customer Acquisition Chart */}
          <div className="lg:col-span-4 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-white tracking-tight">Customer Acquisition</h2>
                <span className="text-xs font-semibold text-[#8083a3]">Tuần này</span>
              </div>
              <p className="text-xs text-[#8083a3] mb-4">Xu hướng doanh thu & số lượng vé theo ngày</p>
            </div>

            {/* Interactive Dual-Curve SVG */}
            <div className="relative my-auto py-2">
              <svg className="w-full h-44" viewBox="0 0 340 170" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="30" x2="340" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="340" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="340" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                <path d={weekRevCurve.areaPath} fill="url(#chartGrad1)" />
                <path d={weekRevCurve.linePath} fill="none" stroke="#6366f1" strokeWidth="3" />

                <path d={weekTicketCurve.areaPath} fill="url(#chartGrad2)" />
                <path d={weekTicketCurve.linePath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
              </svg>

              {/* Day labels below chart */}
              <div className="flex justify-between text-[11px] font-semibold text-[#8083a3] px-2 pt-2 border-t border-white/[0.08]">
                {weeklyRevenue.map((item, idx) => (
                  <button
                    key={item.day}
                    onMouseEnter={() => setHoveredWeekDay(idx)}
                    onMouseLeave={() => setHoveredWeekDay(null)}
                    className={`hover:text-white transition-colors cursor-pointer border-0 bg-transparent ${
                      hoveredWeekDay === idx ? "text-indigo-400 font-bold" : ""
                    }`}
                  >
                    {item.day}
                  </button>
                ))}
              </div>

              {/* Tooltip on hover */}
              {hoveredWeekDay !== null && weeklyRevenue[hoveredWeekDay] && (
                <div className="absolute top-2 right-4 px-3 py-1.5 bg-[#0f1026] border border-white/20 rounded-lg text-xs shadow-xl animate-fade-in">
                  <div className="font-bold text-white">{weeklyRevenue[hoveredWeekDay].day} ({weeklyRevenue[hoveredWeekDay].date})</div>
                  <div className="text-indigo-400 font-semibold">{formatVND(weeklyRevenue[hoveredWeekDay].revenue)}</div>
                  <div className="text-rose-400 font-medium">{weeklyRevenue[hoveredWeekDay].tickets} vé đã bán</div>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/[0.08] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
                <span className="text-[#a0a3c2] font-medium">Doanh thu vé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f43f5e]" />
                <span className="text-[#a0a3c2] font-medium">Lượt vé xem phim</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 3: TOP PERFORMING MOVIES & QUICK MANAGEMENT SHORTCUTS
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Movies (7 cols) */}
          <div className="lg:col-span-7 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Top Performing Movies</h2>
                  <p className="text-xs text-[#8083a3]">Bảng xếp hạng phim có doanh thu phòng vé cao nhất</p>
                </div>
                <button
                  onClick={() => navigate("/admin/movies")}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer border-0 bg-transparent"
                >
                  Quản lý phim →
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {topMovies.map((m, index) => {
                  const maxRev = topMovies[0]?.revenue || 1;
                  const percent = Math.min(100, Math.round((m.revenue / maxRev) * 100));

                  return (
                    <div
                      key={m._id}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          index === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-[#8083a3]"
                        }`}>
                          {index + 1}
                        </span>
                        <img
                          src={m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&q=80"}
                          alt={m.title}
                          className="w-9 h-12 rounded object-cover shrink-0 bg-white/5"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-white truncate max-w-[200px]" title={m.title}>
                            {m.title}
                          </div>
                          <div className="text-xs text-[#8083a3] flex items-center gap-2 mt-0.5">
                            <span>{m.tickets} vé bán ra</span>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">{m.rating || "P"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-white">{formatVND(m.revenue)}</div>
                        <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-[#e8173a] rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Management Shortcuts (5 cols) */}
          <div className="lg:col-span-5 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight mb-1">Quick Actions (Thao tác nhanh)</h2>
              <p className="text-xs text-[#8083a3] mb-4">Các lối tắt quản trị thường dùng trong ca làm việc</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/admin/movies")}
                  className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/15 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                    🎬
                  </div>
                  <div className="font-semibold text-sm text-white">Thêm phim mới</div>
                  <div className="text-[11px] text-[#8083a3]">Khởi tạo bom tấn</div>
                </button>

                <button
                  onClick={() => navigate("/admin/showtimes")}
                  className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/15 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                    🕒
                  </div>
                  <div className="font-semibold text-sm text-white">Xếp suất chiếu</div>
                  <div className="text-[11px] text-[#8083a3]">Tránh trùng lịch phòng</div>
                </button>

                <button
                  onClick={() => navigate("/admin/rooms")}
                  className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                    🏛️
                  </div>
                  <div className="font-semibold text-sm text-white">Phòng chiếu</div>
                  <div className="text-[11px] text-[#8083a3]">Sơ đồ ghế & loại phòng</div>
                </button>

                <button
                  onClick={() => navigate("/admin/vouchers")}
                  className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/15 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                    🏷️
                  </div>
                  <div className="font-semibold text-sm text-white">Tạo Voucher</div>
                  <div className="text-[11px] text-[#8083a3]">Mã giảm giá ưu đãi</div>
                </button>
              </div>
            </div>

            {/* Status summary */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8083a3]">
              <span>Phòng hoạt động: <strong className="text-white">{kpi.activeRooms}/{kpi.totalRooms}</strong></span>
              <span>Phim đang chiếu: <strong className="text-white">{kpi.nowShowingMovies}</strong></span>
              <span>Khách hàng: <strong className="text-white">{kpi.totalUsers}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
