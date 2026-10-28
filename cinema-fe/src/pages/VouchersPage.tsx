import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { voucherService } from "../services/voucherService";
import type { VoucherItem } from "../services/voucherService";
import Navbar from "../components/home/Navbar";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

type ModalState = "none" | "login" | "register";

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);

  // Filters state
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("hot");
  const [search, setSearch] = useState("");

  // Authentication modals
  const [modal, setModal] = useState<ModalState>("none");
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  // Quick Calculator
  const [checkCode, setCheckCode] = useState("");
  const [orderAmount, setOrderAmount] = useState<number>(180000);
  const [calcResult, setCalcResult] = useState<{
    success: boolean;
    message: string;
    discount?: number;
    finalTotal?: number;
  } | null>(null);

  const audienceTabs = [
    { label: "Tất cả ưu đãi", value: "all" },
    { label: "Học sinh - Sinh viên", value: "hssv" },
    { label: "Combo Bắp Nước", value: "combo" },
    { label: "Thành viên & VIP/IMAX", value: "vip" },
  ];

  useEffect(() => {
    fetchVouchers();
  }, [targetFilter, sortBy]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const params: any = {
        target: targetFilter,
        sort: sortBy,
      };
      if (search.trim()) params.search = search.trim();

      const res = await voucherService.getVouchers(params);
      setVouchers(res.vouchers || []);
    } catch (err) {
      console.error("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handleResetFilters = () => {
    setTargetFilter("all");
    setSortBy("hot");
    setSearch("");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setCheckCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleCalculateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkCode.trim()) {
      alert("Vui lòng nhập mã voucher để kiểm tra");
      return;
    }
    try {
      const res = await voucherService.checkVoucher({
        code: checkCode.trim().toUpperCase(),
        orderTotal: Number(orderAmount) || 0,
      });
      setCalcResult({
        success: true,
        message: `${res.message}! Bạn được giảm ${res.discountAmount.toLocaleString()} VNĐ.`,
        discount: res.discountAmount,
        finalTotal: res.finalTotal,
      });
    } catch (err: any) {
      setCalcResult({
        success: false,
        message: err.response?.data?.message || "Mã voucher không hợp lệ hoặc đơn hàng chưa thỏa điều kiện",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white font-inter">
      {/* ── 1. NAVBAR GỐC ĐẦY ĐỦ ── */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setModal("login")}
        onOpenRegister={() => setModal("register")}
        onGoToDashboard={() => navigate("/dashboard")}
      />

      {/* Main Content */}
      <main className="max-w-[1240px] mx-auto px-6 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-semibold mb-3">
            <span>Kho voucher & ưu đãi độc quyền từ rạp chiếu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Kho Voucher & <span className="text-[#e8173a]">Ưu Đãi Độc Quyền</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a0a0b0]">
            Áp dụng mã khuyến mãi khi đặt vé xem phim trực tuyến để nhận ưu đãi giảm giá tức thì cho vé, phòng VIP và bắp nước.
          </p>
        </div>

        {/* Voucher Discount Calculator Banner */}
        <div className="bg-gradient-to-r from-[#161626] via-[#1f1a30] to-[#161626] border border-white/10 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
                <span>Công cụ tính giá vé ưu đãi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Ước tính số tiền tiết kiệm</h2>
              <p className="text-xs sm:text-sm text-[#a0a0b0]">
                Nhập mã voucher và tổng tiền vé ước tính để xem số tiền thanh toán thực tế sau khi áp dụng giảm giá.
              </p>
            </div>

            <form onSubmit={handleCalculateDiscount} className="flex flex-wrap gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Nhập mã (vd: XINCHAO50)"
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                className="px-4 py-2.5 bg-[#0d0d14] border border-white/15 rounded-xl text-white font-mono uppercase text-sm focus:outline-none focus:border-[#e8173a]/60 flex-1 sm:w-48"
              />
              <input
                type="number"
                placeholder="Tổng tiền vé (VNĐ)"
                value={orderAmount}
                onChange={(e) => setOrderAmount(Number(e.target.value))}
                className="px-4 py-2.5 bg-[#0d0d14] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-[#e8173a]/60 flex-1 sm:w-44"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer border-0 shadow-lg shadow-red-950/40"
              >
                Áp dụng & Tính toán
              </button>
            </form>
          </div>

          {calcResult && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm border ${
                calcResult.success
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border-rose-500/30"
              }`}
            >
              <div className="font-semibold">{calcResult.message}</div>
              {calcResult.success && calcResult.finalTotal !== undefined && (
                <div className="text-xs text-white/80 mt-1">
                  Số tiền dự kiến cần thanh toán:{" "}
                  <strong className="text-white text-sm">{calcResult.finalTotal.toLocaleString()} VNĐ</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Section: Quick Audience Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {audienceTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTargetFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                targetFilter === tab.value
                  ? "bg-[#e8173a] text-white border-[#e8173a] shadow-lg shadow-red-950/40"
                  : "bg-[#161626] text-[#a0a0b0] border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Toolbar: Sorting & Search */}
        <div className="bg-[#161626] border border-white/[0.06] rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Sorting */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-[#8e8ea0] whitespace-nowrap">Sắp xếp ưu đãi:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-[#0d0d14] border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
            >
              <option value="hot">Ưu đãi Hot nhất</option>
              <option value="newest">Mới cập nhật</option>
              <option value="expiring_soon">Sắp hết hạn</option>
              <option value="min_order_asc">Đơn tối thiểu thấp nhất</option>
            </select>

            {(targetFilter !== "all" || search || sortBy !== "hot") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#f87083] hover:underline cursor-pointer bg-transparent border-0 px-2 py-1"
              >
                Đặt lại
              </button>
            )}
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên voucher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#e8173a]/60 flex-1 md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer border-0"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* Vouchers Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎁</span> Danh sách mã voucher khả dụng ({vouchers.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#a0a0b0]">Đang tải danh sách mã voucher...</div>
        ) : vouchers.length === 0 ? (
          <div className="py-20 text-center text-[#a0a0b0] bg-[#161626] border border-white/[0.06] rounded-2xl p-8">
            <p className="text-base font-semibold text-white mb-2">Không tìm thấy mã voucher phù hợp</p>
            <p className="text-xs text-[#8e8ea0] mb-4">Vui lòng thử chọn nhóm ưu đãi khác hoặc từ khóa tìm kiếm khác.</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 bg-[#e8173a] hover:bg-[#c91131] text-white text-xs font-semibold rounded-xl cursor-pointer border-0"
            >
              Xem tất cả voucher
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((item) => {
              const isCopied = copiedCode === item.code;
              const isPercentage = item.discountType === "percentage";

              return (
                <div
                  key={item._id}
                  className="bg-[#161626] border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-xl relative group hover:-translate-y-1"
                >
                  {/* Top discount banner */}
                  <div className="p-6 border-b border-dashed border-white/10 bg-gradient-to-br from-white/[0.02] to-white/[0.00] relative">
                    <div className="w-5 h-5 bg-[#0d0d14] rounded-full absolute -left-2.5 -bottom-2.5 border-r border-white/10" />
                    <div className="w-5 h-5 bg-[#0d0d14] rounded-full absolute -right-2.5 -bottom-2.5 border-l border-white/10" />

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#86efac] tracking-tight">
                        {isPercentage ? `GIẢM ${item.discountValue}%` : `-${item.discountValue.toLocaleString()}đ`}
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[0.7rem] uppercase text-[#a0a0b0] font-semibold tracking-wider">
                        {item.discountType === "percentage" ? "Phần trăm" : "Tiền mặt"}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug mb-1">{item.title}</h3>
                    <p className="text-xs text-[#a0a0b0] line-clamp-2">
                      {item.description || "Áp dụng cho mọi đơn đặt vé xem phim trực tuyến."}
                    </p>
                  </div>

                  {/* Conditions & Action */}
                  <div className="p-6 pt-5 flex flex-col gap-4 flex-1 justify-between bg-black/10">
                    <div className="space-y-1.5 text-xs text-[#9ca3af]">
                      <div className="flex justify-between">
                        <span>Đơn tối thiểu:</span>
                        <span className="text-white font-medium">
                          {item.minOrderValue > 0 ? `${item.minOrderValue.toLocaleString()} VNĐ` : "Không giới hạn"}
                        </span>
                      </div>
                      {isPercentage && item.maxDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Giảm tối đa:</span>
                          <span className="text-white font-medium">{item.maxDiscount.toLocaleString()} VNĐ</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Hạn sử dụng:</span>
                        <span className="text-amber-300 font-medium">
                          {new Date(item.endDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    {/* Code Copy & Details Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2 p-2 bg-[#0d0d14] border border-white/10 rounded-xl">
                        <span className="font-mono font-bold text-sm text-[#f87083] pl-2 tracking-wider">
                          {item.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(item.code)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-[#e8173a] hover:bg-[#c91131] text-white"
                          }`}
                        >
                          {isCopied ? "Đã copy!" : "Copy mã"}
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedVoucher(item)}
                        className="w-full py-1.5 text-xs text-[#a0a0c0] hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-center"
                      >
                        Xem chi tiết điều kiện áp dụng &rsaquo;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161626] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center cursor-pointer border-0 text-xs font-bold"
            >
              x
            </button>

            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold block">Chi tiết ưu đãi</span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedVoucher.title}</h3>
            </div>

            <div className="p-4 bg-[#0d0d14] rounded-xl border border-white/10 mb-5">
              <div className="text-xs text-[#a0a0b0] mb-1">Mã ưu đãi:</div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-xl text-[#86efac] tracking-wider">
                  {selectedVoucher.code}
                </span>
                <button
                  onClick={() => handleCopyCode(selectedVoucher.code)}
                  className="px-4 py-1.5 bg-[#e8173a] hover:bg-[#c91131] text-white text-xs font-semibold rounded-lg cursor-pointer border-0"
                >
                  {copiedCode === selectedVoucher.code ? "Đã copy!" : "Sao chép mã"}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#d1d5db] border-t border-b border-white/[0.08] py-4 mb-6">
              <div className="flex justify-between">
                <span className="text-[#a0a0b0]">Mức giảm giá:</span>
                <strong className="text-white">
                  {selectedVoucher.discountType === "percentage"
                    ? `Giảm ${selectedVoucher.discountValue}%`
                    : `Giảm ${selectedVoucher.discountValue.toLocaleString()} VNĐ`}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a0a0b0]">Đơn tối thiểu:</span>
                <strong className="text-white">
                  {selectedVoucher.minOrderValue > 0
                    ? `${selectedVoucher.minOrderValue.toLocaleString()} VNĐ`
                    : "Không yêu cầu"}
                </strong>
              </div>
              {selectedVoucher.discountType === "percentage" && selectedVoucher.maxDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#a0a0b0]">Mức giảm tối đa:</span>
                  <strong className="text-white">{selectedVoucher.maxDiscount.toLocaleString()} VNĐ</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#a0a0b0]">Thời hạn áp dụng:</span>
                <strong className="text-amber-300">
                  {new Date(selectedVoucher.endDate).toLocaleDateString("vi-VN")}
                </strong>
              </div>
              <div className="pt-2">
                <span className="text-[#a0a0b0] block text-xs mb-1">Mô tả / Điều kiện chi tiết:</span>
                <p className="text-xs leading-relaxed text-[#c4b5fd]">
                  {selectedVoucher.description || "Áp dụng cho mọi khách hàng đặt vé xem phim trực tuyến tại hệ thống rạp."}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-6 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer border-0"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal("none")}
          onSuccess={() => {
            setModal("none");
            navigate("/dashboard");
          }}
          onSwitchToRegister={() => setModal("register")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </div>
  );
}
