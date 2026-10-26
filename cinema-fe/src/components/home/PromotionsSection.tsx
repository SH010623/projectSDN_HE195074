import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { PromoItem } from "./types";
import { voucherService } from "../../services/voucherService";
import type { VoucherItem } from "../../services/voucherService";

interface PromotionsSectionProps {
  promos: PromoItem[];
  id?: string;
}

export default function PromotionsSection({ promos, id = "promotions" }: PromotionsSectionProps) {
  const navigate = useNavigate();
  const [activeVouchers, setActiveVouchers] = useState<VoucherItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchersPreview();
  }, []);

  const fetchVouchersPreview = async () => {
    try {
      const res = await voucherService.getVouchers();
      setActiveVouchers(res.vouchers.slice(0, 3));
    } catch (err) {
      // Fallback silently if not yet loaded
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
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold tracking-widest uppercase mb-1">
              <span>🎟️</span>
              <span>Ưu đãi & Giảm giá</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f0f5]">
              Khuyến mãi & Mã giảm giá đặc quyền
            </h2>
          </div>

          <button
            onClick={() => navigate("/vouchers")}
            className="text-sm font-semibold text-[#e8173a] hover:text-[#f87083] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
          >
            <span>Tất cả mã giảm giá</span>
            <span>&rsaquo;</span>
          </button>
        </div>

        {/* Dynamic Vouchers Showcase if available */}
        {activeVouchers.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#a0a0b8] mb-4 flex items-center gap-2">
              <span>🔥</span>
              <span>Mã Voucher Hot đang diễn ra (Bấm để copy mã)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeVouchers.map((v) => {
                const isCopied = copiedCode === v.code;
                const isPercent = v.discountType === "percentage";
                return (
                  <div
                    key={v._id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1c30] to-[#121220] border border-white/10 hover:border-rose-500/40 transition-all duration-200 flex flex-col justify-between shadow-xl relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-2xl font-black text-[#86efac]">
                        {isPercent ? `GIẢM ${v.discountValue}%` : `-${v.discountValue.toLocaleString()}đ`}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[0.68rem] font-bold uppercase rounded-md tracking-wider">
                        HOT DEAL
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base leading-snug mb-1">{v.title}</h4>
                    <p className="text-xs text-[#9090a8] line-clamp-2 mb-4">
                      {v.description || "Áp dụng khi đặt vé xem phim trực tuyến."}
                    </p>

                    <div className="pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#f87083] tracking-wider">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Cinema Promotions Cards */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#a0a0b8] mb-4 flex items-center gap-2">
          <span>🌟</span>
          <span>Chương trình thành viên & Gói vé ưu đãi</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promos.map((promo) => (
            <div
              key={promo.id}
              id={promo.id}
              className={`p-7 rounded-2xl border border-white/[0.08] bg-gradient-to-br ${promo.bg} flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-default shadow-lg`}
            >
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{promo.label}</h3>
              <p className="text-sm text-white/70 leading-relaxed flex-1">{promo.desc}</p>
              <button
                id={`${promo.id}-btn`}
                onClick={() => navigate("/vouchers")}
                className="mt-5 self-start px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-[#f0f0f5] text-xs font-semibold hover:border-white/50 transition-colors cursor-pointer"
              >
                Nhận ưu đãi ngay &rsaquo;
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
