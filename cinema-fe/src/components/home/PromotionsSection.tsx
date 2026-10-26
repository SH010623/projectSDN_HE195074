import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { voucherService } from "../../services/voucherService";
import type { VoucherItem } from "../../services/voucherService";

interface PromotionsSectionProps {
  id?: string;
}

export default function PromotionsSection({ id = "promotions" }: PromotionsSectionProps) {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getVouchers();
      setVouchers(res.vouchers || []);
    } catch (err) {
      console.error("Failed to load promotions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="py-16 bg-[#0d0d14] border-t border-white/[0.04]" id={id}>
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#e8173a] text-xs font-bold tracking-widest uppercase mb-1">
              <span>🎟️</span>
              <span>Ưu đãi & Khuyến mãi từ Rạp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f0f5]">
              Mã giảm giá & Khuyến mãi đặc quyền
            </h2>
          </div>

          <button
            onClick={() => navigate("/vouchers")}
            className="text-sm font-semibold text-[#e8173a] hover:text-[#f87083] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
          >
            <span>Xem tất cả voucher</span>
            <span>&rsaquo;</span>
          </button>
        </div>

        {/* Dynamic Vouchers from Database */}
        {loading ? (
          <div className="py-16 text-center text-[#8888a0]">Đang tải danh sách khuyến mãi...</div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12 text-[#7070a0] bg-[#13131f] rounded-2xl border border-white/[0.06]">
            <p className="text-base font-medium">Hiện chưa có mã khuyến mãi nào đang áp dụng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((v) => {
              const isCopied = copiedCode === v.code;
              const isPercent = v.discountType === "percentage";

              return (
                <div
                  key={v._id}
                  className="bg-gradient-to-br from-[#1c1c2e] to-[#131322] border border-white/10 hover:border-rose-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
                >
                  {/* Top discount header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#86efac] tracking-tight">
                        {isPercent ? `GIẢM ${v.discountValue}%` : `-${v.discountValue.toLocaleString()}đ`}
                      </span>
                      <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[0.68rem] font-bold uppercase rounded-md tracking-wider">
                        {isPercent ? "ƯU ĐÃI %" : "TIỀN MẶT"}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-rose-300 transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-xs text-[#a0a0b8] line-clamp-2 leading-relaxed mb-4">
                      {v.description || "Áp dụng khi đặt vé xem phim trực tuyến tại cụm rạp."}
                    </p>

                    <div className="text-[0.75rem] text-[#9090a8] space-y-1 mb-5">
                      <div className="flex justify-between">
                        <span>Đơn tối thiểu:</span>
                        <span className="text-white font-medium">
                          {v.minOrderValue > 0 ? `${v.minOrderValue.toLocaleString()} VNĐ` : "Không giới hạn"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hạn dùng:</span>
                        <span className="text-amber-300 font-medium">
                          {new Date(v.endDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Copy code + Chi tiết */}
                  <div className="pt-4 border-t border-dashed border-white/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 p-2 bg-[#0d0d14] border border-white/10 rounded-xl">
                      <span className="font-mono font-bold text-sm text-[#f87083] pl-2 tracking-wider">
                        {v.code}
                      </span>
                      <button
                        onClick={() => handleCopy(v.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-[#e8173a] hover:bg-[#c91131] text-white"
                        }`}
                      >
                        {isCopied ? "✓ Đã copy!" : "Copy mã"}
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedVoucher(v)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-[#d0d0e0] hover:text-white transition-colors cursor-pointer text-center"
                    >
                      Xem chi tiết &rsaquo;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voucher Detail Modal right on Homepage (Keeps user on the page and maintains Navbar) */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161626] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center cursor-pointer border-0 text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎟️</span>
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold block">Thông tin chi tiết ưu đãi</span>
                <h3 className="text-xl font-bold text-white">{selectedVoucher.title}</h3>
              </div>
            </div>

            <div className="p-4 bg-[#0d0d14] rounded-xl border border-white/10 mb-5">
              <div className="text-xs text-[#a0a0b0] mb-1">Mã voucher:</div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-xl text-[#86efac] tracking-wider">
                  {selectedVoucher.code}
                </span>
                <button
                  onClick={() => handleCopy(selectedVoucher.code)}
                  className="px-4 py-1.5 bg-[#e8173a] hover:bg-[#c91131] text-white text-xs font-semibold rounded-lg cursor-pointer border-0"
                >
                  {copiedCode === selectedVoucher.code ? "✓ Đã copy!" : "Sao chép mã"}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#d1d5db] border-t border-b border-white/[0.08] py-4 mb-6">
              <div className="flex justify-between">
                <span className="text-[#a0a0b0]">Mức giảm:</span>
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
                    : "Không giới hạn"}
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
                <span className="text-[#a0a0b0] block text-xs mb-1">Mô tả / Điều kiện áp dụng:</span>
                <p className="text-xs leading-relaxed text-[#c4b5fd]">
                  {selectedVoucher.description || "Áp dụng cho mọi khách hàng đặt vé xem phim trực tuyến tại hệ thống rạp."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
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
    </section>
  );
}
