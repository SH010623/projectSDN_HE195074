import { useEffect, useState } from "react";
import { reportService } from "../services/reportService";
import type { ReportAnalyticsResponse } from "../services/reportService";

// Helper: Format VNĐ currency
const formatVND = (num: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num || 0);

// Helper: Generate smooth Bezier curve SVG path for Trend Chart
function generateBezierSvg(data: number[], width: number, height: number, padding = 12) {
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

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"movies" | "rooms" | "seats" | "vouchers">("movies");

  const [data, setData] = useState<ReportAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [movieSearch, setMovieSearch] = useState("");

  useEffect(() => {
    fetchReport();
  }, [timeRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { timeRange };
      if (timeRange === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }
      const res = await reportService.getAnalytics(params);
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải số liệu báo cáo thống kê");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStartDate || !customEndDate) {
      alert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }
    fetchReport();
  };

  // Export CSV Report Feature
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "\uFEFF"; // UTF-8 BOM for Microsoft Excel compatibility
    csvContent += "BÁO CÁO DOANH THU & HOẠT ĐỘNG RẠP CHIẾU PHIM NCC CINEMA\n";
    csvContent += `Thời gian báo cáo: ${data.filter.startDate} đến ${data.filter.endDate}\n\n`;

    // 1. Tổng quan
    csvContent += "TỔNG QUAN KINH DOANH\n";
    csvContent += `Tổng doanh thu thực tế,${data.summary.totalRevenue} VNĐ\n`;
    csvContent += `Tổng số vé đã bán,${data.summary.totalTicketsSold} vé\n`;
    csvContent += `Tổng số đơn đặt vé,${data.summary.totalConfirmedOrders} đơn\n`;
    csvContent += `Tổng tiền chiết khấu voucher,${data.summary.totalDiscountAmount} VNĐ\n`;
    csvContent += `Tổng tiền hoàn vé đã huỷ,${data.summary.totalRefundedAmount} VNĐ\n`;
    csvContent += `Giá vé trung bình,${data.summary.avgTicketPrice} VNĐ\n\n`;

    // 2. Chi tiết theo phim
    csvContent += "DOANH THU THEO PHIM\n";
    csvContent += "STT,Tên phim,Thể loại,Độ tuổi,Số vé đã bán,Doanh thu (VNĐ),Tỷ lệ đóng góp (%)\n";
    data.movieBreakdown.forEach((m, idx) => {
      csvContent += `${idx + 1},"${m.title}","${m.genres?.join("/") || ""}",${m.rating || "P"},${m.ticketsSold},${m.revenue},${m.revenueShare}%\n`;
    });
    csvContent += "\n";

    // 3. Hiệu suất phòng chiếu
    csvContent += "HIỆU SUẤT THEO PHÒNG CHIẾU\n";
    csvContent += "STT,Tên phòng,Loại phòng,Tổng ghế,Số vé đã bán,Doanh thu (VNĐ),Tỷ lệ lấp đầy (%)\n";
    data.roomBreakdown.forEach((r, idx) => {
      csvContent += `${idx + 1},"${r.name}",${r.roomType},${r.totalSeats},${r.ticketsSold},${r.revenue},${r.occupancyRate}%\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_DoanhThu_${data.filter.startDate}_${data.filter.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = data?.summary || {
    totalRevenue: 0,
    totalOriginalPrice: 0,
    totalDiscountAmount: 0,
    totalTicketsSold: 0,
    totalConfirmedOrders: 0,
    totalRefundedAmount: 0,
    totalRefundedOrders: 0,
    avgTicketPrice: 0,
    avgOrderValue: 0,
    cancellationRate: 0,
  };

  const dailyTrend = data?.dailyTrend || [];
  const trendRevenues = dailyTrend.map((d) => d.revenue);
  const trendCurve = generateBezierSvg(trendRevenues, 600, 150, 16);

  const filteredMovies = (data?.movieBreakdown || []).filter((m) =>
    m.title.toLowerCase().includes(movieSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d1c] text-[#e2e8f0]">
      {/* ── Top Header & Filter Controls ── */}
      <header className="bg-[#111229]/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-4 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📈 Báo Cáo Thống Kê & Phân Tích Nghiệp Vụ</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e8173a]/20 text-[#f87083] font-bold">
              ANALYTICS
            </span>
          </h1>
          <p className="text-xs text-[#8083a3] mt-0.5">
            Dữ liệu từ {data?.filter.startDate || "..."} đến {data?.filter.endDate || "..."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Date Range Filter */}
          <div className="flex items-center bg-[#161733] border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTimeRange("today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                timeRange === "today"
                  ? "bg-[#e8173a] text-white shadow"
                  : "bg-transparent text-[#9fa2c4] hover:text-white"
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange("7days")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                timeRange === "7days"
                  ? "bg-[#e8173a] text-white shadow"
                  : "bg-transparent text-[#9fa2c4] hover:text-white"
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeRange("this_month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                timeRange === "this_month"
                  ? "bg-[#e8173a] text-white shadow"
                  : "bg-transparent text-[#9fa2c4] hover:text-white"
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeRange("30days")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                timeRange === "30days"
                  ? "bg-[#e8173a] text-white shadow"
                  : "bg-transparent text-[#9fa2c4] hover:text-white"
              }`}
            >
              30 ngày qua
            </button>
            <button
              onClick={() => setTimeRange("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                timeRange === "custom"
                  ? "bg-[#e8173a] text-white shadow"
                  : "bg-transparent text-[#9fa2c4] hover:text-white"
              }`}
            >
              Tùy chọn
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={loading || !data}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer border-0 flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <span>📥</span>
            <span>Xuất Excel/CSV</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            title="Làm mới số liệu"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
          </button>
        </div>
      </header>

      {/* ── Custom Date Range Picker Bar (if custom selected) ── */}
      {timeRange === "custom" && (
        <form
          onSubmit={handleApplyCustomFilter}
          className="bg-[#141530] border-b border-white/[0.08] px-6 py-3 flex items-center gap-3 flex-wrap text-xs"
        >
          <span className="text-[#9fa2c4] font-medium">Khoảng ngày:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            required
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-[#e8173a]/60"
          />
          <span className="text-[#9fa2c4]">đến</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            required
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-[#e8173a]/60"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#e8173a] hover:bg-[#c91131] text-white rounded-lg font-semibold transition-colors cursor-pointer border-0"
          >
            Áp dụng
          </button>
        </form>
      )}

      {/* ── Main Body Container ── */}
      <div className="p-6 flex flex-col gap-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={fetchReport} className="text-xs underline text-rose-200">
              Thử lại
            </button>
          </div>
        )}

        {/* ── 1. Smart Business Insights Banner ── */}
        {data?.insights && data.insights.length > 0 && (
          <div className="bg-gradient-to-r from-[#171838] via-[#1a1b40] to-[#171838] border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">💡</span>
              <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                Nhận Định & Khuyến Nghị Nghiệp Vụ Tự Động
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#cbd5e1]">
              {data.insights.map((text, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]"
                >
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span className="leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. Top 4 Overview Metric KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu thực tế */}
          <div className="bg-[#141530] border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8b8ea8] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Doanh Thu Thực Thu</span>
              <span className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                💰
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {formatVND(summary.totalRevenue)}
            </div>
            <div className="mt-2 text-xs text-[#8083a3] flex items-center justify-between">
              <span>Giá vé gốc: {formatVND(summary.totalOriginalPrice)}</span>
              <span className="text-emerald-400 font-semibold">{summary.totalConfirmedOrders} đơn</span>
            </div>
          </div>

          {/* Card 2: Tổng số vé bán ra */}
          <div className="bg-[#141530] border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8b8ea8] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Vé Đã Bán Ra</span>
              <span className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center text-sm">
                🎟️
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {summary.totalTicketsSold} <span className="text-sm font-semibold text-[#8b8ea8]">vé</span>
            </div>
            <div className="mt-2 text-xs text-[#8083a3] flex items-center justify-between">
              <span>Giá TB/vé: {formatVND(summary.avgTicketPrice)}</span>
              <span className="text-rose-400 font-semibold">Đã xuất rạp</span>
            </div>
          </div>

          {/* Card 3: Chiết khấu Voucher */}
          <div className="bg-[#141530] border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8b8ea8] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Ưu Đãi Đã Chiết Khấu</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm">
                🏷️
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {formatVND(summary.totalDiscountAmount)}
            </div>
            <div className="mt-2 text-xs text-[#8083a3] flex items-center justify-between">
              <span>Mức chiết khấu:</span>
              <span className="text-emerald-300 font-semibold">
                {summary.totalOriginalPrice > 0
                  ? Math.round((summary.totalDiscountAmount / summary.totalOriginalPrice) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Card 4: Hoàn tiền / Huỷ vé */}
          <div className="bg-[#141530] border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8b8ea8] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Huỷ Vé & Hoàn Tiền</span>
              <span className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-sm">
                ↩️
              </span>
            </div>
            <div className="text-2xl font-black text-rose-300 tracking-tight">
              {formatVND(summary.totalRefundedAmount)}
            </div>
            <div className="mt-2 text-xs text-[#8083a3] flex items-center justify-between">
              <span>Số đơn huỷ: {summary.totalRefundedOrders}</span>
              <span className="text-rose-400 font-semibold">Tỷ lệ: {summary.cancellationRate}%</span>
            </div>
          </div>
        </div>

        {/* ── 3. Interactive Tab Navigation ── */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("movies")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "movies"
                ? "bg-[#e8173a] text-white shadow-lg shadow-[#e8173a]/25"
                : "bg-white/5 text-[#9fa2c4] hover:text-white"
            }`}
          >
            <span>🎬</span>
            <span>Doanh Thu Theo Phim</span>
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "rooms"
                ? "bg-[#e8173a] text-white shadow-lg shadow-[#e8173a]/25"
                : "bg-white/5 text-[#9fa2c4] hover:text-white"
            }`}
          >
            <span>🏛️</span>
            <span>Phòng Chiếu & Khung Giờ Vàng</span>
          </button>
          <button
            onClick={() => setActiveTab("seats")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "seats"
                ? "bg-[#e8173a] text-white shadow-lg shadow-[#e8173a]/25"
                : "bg-white/5 text-[#9fa2c4] hover:text-white"
            }`}
          >
            <span>💺</span>
            <span>Hạng Ghế & Phương Thức Thanh Toán</span>
          </button>
          <button
            onClick={() => setActiveTab("vouchers")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "vouchers"
                ? "bg-[#e8173a] text-white shadow-lg shadow-[#e8173a]/25"
                : "bg-white/5 text-[#9fa2c4] hover:text-white"
            }`}
          >
            <span>👑</span>
            <span>Khách Hàng VIP & Voucher</span>
          </button>
        </div>

        {/* ── TAB 1: DOANH THU THEO PHIM & BIỂU ĐỒ XU HƯỚNG ── */}
        {activeTab === "movies" && (
          <div className="flex flex-col gap-6">
            {/* Trend Chart (SVG Curve) */}
            <div className="bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Biểu Đồ Xu Hướng Doanh Thu Theo Ngày
                  </h3>
                  <p className="text-xs text-[#8083a3]">
                    Biến động doanh thu phòng vé trong mốc thời gian đã chọn
                  </p>
                </div>
                {hoveredTrendIdx !== null && dailyTrend[hoveredTrendIdx] && (
                  <div className="text-right">
                    <span className="text-xs text-indigo-400 font-bold block">
                      {dailyTrend[hoveredTrendIdx].date} ({dailyTrend[hoveredTrendIdx].tickets} vé)
                    </span>
                    <span className="text-sm font-black text-white">
                      {formatVND(dailyTrend[hoveredTrendIdx].revenue)}
                    </span>
                  </div>
                )}
              </div>

              {/* SVG Area Chart */}
              <div className="relative py-2">
                <svg className="w-full h-40" viewBox="0 0 600 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  <path d={trendCurve.areaPath} fill="url(#trendGrad)" />
                  <path d={trendCurve.linePath} fill="none" stroke="#818cf8" strokeWidth="3" />
                </svg>

                {/* Day Labels */}
                <div className="flex justify-between text-[11px] font-semibold text-[#8083a3] px-2 pt-2 border-t border-white/[0.08] overflow-x-auto">
                  {dailyTrend.map((d, idx) => (
                    <button
                      key={d.date}
                      onMouseEnter={() => setHoveredTrendIdx(idx)}
                      onMouseLeave={() => setHoveredTrendIdx(null)}
                      className={`hover:text-white transition-colors cursor-pointer border-0 bg-transparent px-1 ${
                        hoveredTrendIdx === idx ? "text-indigo-400 font-bold" : ""
                      }`}
                    >
                      {d.displayDate}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Movie Breakdown Table */}
            <div className="bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Bảng Kê Chi Tiết Hiệu Suất Theo Phim
                  </h3>
                  <p className="text-xs text-[#8083a3]">
                    Xếp hạng theo doanh thu và tỷ lệ đóng góp vào phòng vé
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-[#606385] outline-none focus:border-[#e8173a]/50"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#8083a3] font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-2">#</th>
                      <th className="py-3 px-3">Phim</th>
                      <th className="py-3 px-3">Độ tuổi / Thể loại</th>
                      <th className="py-3 px-3">Số vé đã bán</th>
                      <th className="py-3 px-3">Số đơn vé</th>
                      <th className="py-3 px-3">Doanh thu</th>
                      <th className="py-3 px-3">Tỷ trọng (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredMovies.map((m, idx) => (
                      <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-2 text-[#707393] font-medium">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-[180px]">
                            <img
                              src={m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&q=80"}
                              alt={m.title}
                              className="w-9 h-12 rounded object-cover shrink-0 bg-white/5"
                            />
                            <div className="truncate">
                              <div className="font-semibold text-white truncate" title={m.title}>
                                {m.title}
                              </div>
                              <div className="text-[11px] text-[#8083a3] truncate">{m.titleEn || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] mr-2">
                            {m.rating || "P"}
                          </span>
                          <span className="text-[#9fa2c4]">{m.genres?.slice(0, 2).join(", ") || "Điện ảnh"}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">{m.ticketsSold} vé</td>
                        <td className="py-3 px-3 text-[#9fa2c4]">{m.ordersCount} đơn</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{formatVND(m.revenue)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{m.revenueShare}%</span>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-rose-500 to-[#e8173a] rounded-full"
                                style={{ width: `${m.revenueShare}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PHÒNG CHIẾU & KHUNG GIỜ VÀNG ── */}
        {activeTab === "rooms" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Room Occupancy Performance */}
            <div className="lg:col-span-6 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight mb-1">
                  Hiệu Suất & Tỷ Lệ Lấp Đầy Ghế Phòng Chiếu
                </h3>
                <p className="text-xs text-[#8083a3] mb-4">
                  Đo lường mức độ lấp đầy chỗ ngồi của từng phòng chiếu rạp
                </p>

                <div className="flex flex-col gap-3">
                  {(data?.roomBreakdown || []).map((r) => (
                    <div
                      key={r._id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{r.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            {r.roomType}
                          </span>
                        </div>
                        <div className="text-xs text-[#8083a3] mt-1">
                          Tổng sức chứa: <strong className="text-white">{r.totalSeats} ghế</strong> • Đã bán:{" "}
                          <strong className="text-rose-400">{r.ticketsSold} vé</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-base text-emerald-400">
                          {r.occupancyRate}%
                        </div>
                        <div className="w-24 h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${r.occupancyRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Peak Hours Analysis */}
            <div className="lg:col-span-6 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight mb-1">
                  Phân Tích Khung Giờ Vàng (Peak Hours)
                </h3>
                <p className="text-xs text-[#8083a3] mb-4">
                  Tỷ trọng lượng khách và doanh thu theo 4 ca chiếu trong ngày
                </p>

                <div className="flex flex-col gap-3">
                  {(data?.timeSlots || []).map((slot) => (
                    <div
                      key={slot.key}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{slot.name}</span>
                        <span className="text-sm font-bold text-indigo-400">{formatVND(slot.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#8083a3]">
                        <span>{slot.tickets} vé bán ra ({slot.orders} đơn)</span>
                        <span className="font-semibold text-white">{slot.share}% tổng doanh thu</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${slot.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: HẠNG GHẾ & THANH TOÁN ── */}
        {activeTab === "seats" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Seat Types Breakdown */}
            <div className="lg:col-span-6 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Phân Loại Doanh Thu Theo Hạng Ghế
              </h3>
              <p className="text-xs text-[#8083a3] mb-4">
                So sánh lượng vé và doanh thu giữa Ghế Thường và Ghế VIP (phụ thu +15k)
              </p>

              <div className="flex flex-col gap-4">
                {(data?.seatTypes || []).map((st) => (
                  <div
                    key={st.key}
                    className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{st.key === "vip" ? "⭐" : "💺"}</span>
                        <span>{st.name}</span>
                      </div>
                      <div className="text-xs text-[#8083a3] mt-1">
                        Tổng cộng: <strong className="text-white">{st.count} ghế đã bán</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-400">{formatVND(st.revenue)}</div>
                      <span className="text-xs text-[#8083a3] font-semibold">Chiếm {st.share}% doanh thu</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="lg:col-span-6 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Phương Thức Thanh Toán Sử Dụng
              </h3>
              <p className="text-xs text-[#8083a3] mb-4">
                Tỷ trọng giao dịch qua các cổng thanh toán điện tử và tiền mặt
              </p>

              <div className="flex flex-col gap-3">
                {(data?.paymentMethods || []).map((pm) => (
                  <div
                    key={pm.key}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{pm.name}</span>
                      <span className="font-bold text-xs text-white">{formatVND(pm.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#8083a3]">
                      <span>{pm.count} giao dịch</span>
                      <span>{pm.share}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
                        style={{ width: `${pm.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: KHÁCH HÀNG VIP & HIỆU QUẢ VOUCHER ── */}
        {activeTab === "vouchers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Spenders (Customer Ranking) */}
            <div className="lg:col-span-7 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Top Khách Hàng Chi Tiêu & Xếp Hạng Thành Viên
              </h3>
              <p className="text-xs text-[#8083a3] mb-4">
                Bảng xếp hạng khách hàng trung thành đóng góp doanh thu lớn nhất
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#8083a3] font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-2">#</th>
                      <th className="py-2.5 px-3">Khách hàng</th>
                      <th className="py-2.5 px-3">Hạng thành viên</th>
                      <th className="py-2.5 px-3">Số vé</th>
                      <th className="py-2.5 px-3">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(data?.topSpenders || []).map((u, idx) => (
                      <tr key={u._id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-2 text-[#707393] font-medium">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-[#8083a3]">{u.email || u.phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${u.tierColor}`}
                          >
                            {u.tier}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#9fa2c4]">
                          {u.ticketsCount} vé ({u.ordersCount} đơn)
                        </td>
                        <td className="py-3 px-3 font-bold text-white">{formatVND(u.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Voucher Performance */}
            <div className="lg:col-span-5 bg-[#141530] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Hiệu Quả Các Mã Voucher Khuyến Mãi
              </h3>
              <p className="text-xs text-[#8083a3] mb-4">
                Số lần áp dụng và tổng chiết khấu của từng mã giảm giá
              </p>

              <div className="flex flex-col gap-3">
                {(data?.voucherList || []).length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8083a3]">
                    Chưa có mã voucher nào được áp dụng trong khoảng thời gian này
                  </div>
                ) : (
                  (data?.voucherList || []).map((v) => (
                    <div
                      key={v.code}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {v.code}
                        </span>
                        <div className="text-xs text-[#8083a3] mt-1.5">
                          Đã dùng: <strong className="text-white">{v.timesUsed} lần</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#8083a3]">Tổng chiết khấu</div>
                        <div className="text-sm font-bold text-rose-400">{formatVND(v.totalDiscount)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

