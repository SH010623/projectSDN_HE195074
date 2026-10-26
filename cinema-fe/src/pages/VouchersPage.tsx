import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { voucherService } from "../services/voucherService";
import type { VoucherItem } from "../services/voucherService";

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick Calculator
  const [checkCode, setCheckCode] = useState("");
  const [orderAmount, setOrderAmount] = useState<number>(180000);
  const [calcResult, setCalcResult] = useState<{
    success: boolean;
    message: string;
    discount?: number;
    finalTotal?: number;
  } | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      // Public view only gets active vouchers
      const res = await voucherService.getVouchers();
      setVouchers(res.vouchers);
    } catch (err) {
      console.error("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
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
      alert("Please enter a voucher code");
      return;
    }
    try {
      const res = await voucherService.checkVoucher({
        code: checkCode.trim().toUpperCase(),
        orderTotal: Number(orderAmount) || 0,
      });
      setCalcResult({
        success: true,
        message: `${res.message}! You save ${res.discountAmount.toLocaleString()} VND.`,
        discount: res.discountAmount,
        finalTotal: res.finalTotal,
      });
    } catch (err: any) {
      setCalcResult({
        success: false,
        message: err.response?.data?.message || "Invalid or ineligible voucher code",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white font-inter">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 bg-[#e8173a] flex items-center justify-center rounded-lg">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wider uppercase block">Cinema Offers</span>
              <span className="text-xs text-[#a0a0b0]">Vouchers & discount deals</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/news")}
              className="px-4 py-2 bg-[#161626] border border-white/10 hover:border-white/20 text-sm font-medium rounded-xl text-cyan-300 transition-colors cursor-pointer"
            >
              📰 Read News
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[#161626] border border-white/10 hover:border-white/20 text-sm font-medium rounded-xl text-[#d0d0e0] hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1240px] mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Exclusive <span className="text-[#e8173a]">Vouchers</span> & Deals
          </h1>
          <p className="text-sm sm:text-base text-[#a0a0b0]">
            Apply promo codes at checkout to get special discounts on movie tickets, VIP rooms, and combo snacks.
          </p>
        </div>

        {/* Voucher Discount Calculator Banner */}
        <div className="bg-gradient-to-r from-[#161626] via-[#1f1a30] to-[#161626] border border-white/10 rounded-2xl p-6 sm:p-8 mb-12 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
                <span>⚡</span>
                <span>Voucher Savings Calculator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Check Your Discount Before Booking</h2>
              <p className="text-xs sm:text-sm text-[#a0a0b0]">
                Enter any promo code below along with your estimated ticket total to preview your final discounted price.
              </p>
            </div>

            <form onSubmit={handleCalculateDiscount} className="flex flex-wrap gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Enter Code (e.g. WELCOME50)"
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                className="px-4 py-2.5 bg-[#0d0d14] border border-white/15 rounded-xl text-white font-mono uppercase text-sm focus:outline-none focus:border-[#e8173a]/60 flex-1 sm:w-48"
              />
              <input
                type="number"
                placeholder="Ticket Total (VND)"
                value={orderAmount}
                onChange={(e) => setOrderAmount(Number(e.target.value))}
                className="px-4 py-2.5 bg-[#0d0d14] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-[#e8173a]/60 flex-1 sm:w-44"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer border-0 shadow-lg shadow-red-950/40"
              >
                Apply & Calculate
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
                  Estimated Final Payable Total:{" "}
                  <strong className="text-white text-sm">{calcResult.finalTotal.toLocaleString()} VND</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vouchers Grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🎁</span> Available Voucher Codes ({vouchers.length})
        </h2>

        {loading ? (
          <div className="py-20 text-center text-[#a0a0b0]">Loading promotional vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="py-20 text-center text-[#a0a0b0]">
            No active vouchers at this time. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((item) => {
              const isCopied = copiedCode === item.code;
              const isPercentage = item.discountType === "percentage";

              return (
                <div
                  key={item._id}
                  className="bg-[#161626] border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-xl relative group"
                >
                  {/* Top discount banner */}
                  <div className="p-6 border-b border-dashed border-white/10 bg-gradient-to-br from-white/[0.02] to-white/[0.00] relative">
                    {/* Circle cutouts for ticket voucher look */}
                    <div className="w-5 h-5 bg-[#0d0d14] rounded-full absolute -left-2.5 -bottom-2.5 border-r border-white/10" />
                    <div className="w-5 h-5 bg-[#0d0d14] rounded-full absolute -right-2.5 -bottom-2.5 border-l border-white/10" />

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#86efac] tracking-tight">
                        {isPercentage ? `${item.discountValue}% OFF` : `-${item.discountValue.toLocaleString()}đ`}
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[0.7rem] uppercase text-[#a0a0b0] font-semibold tracking-wider">
                        {item.discountType}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug mb-1">{item.title}</h3>
                    <p className="text-xs text-[#a0a0b0] line-clamp-2">
                      {item.description || "Applicable for online movie ticket bookings."}
                    </p>
                  </div>

                  {/* Conditions & Action */}
                  <div className="p-6 pt-5 flex flex-col gap-4 flex-1 justify-between bg-black/10">
                    <div className="space-y-1.5 text-xs text-[#9ca3af]">
                      <div className="flex justify-between">
                        <span>Min Order:</span>
                        <span className="text-white font-medium">
                          {item.minOrderValue > 0 ? `${item.minOrderValue.toLocaleString()} VND` : "None"}
                        </span>
                      </div>
                      {isPercentage && item.maxDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Max Discount:</span>
                          <span className="text-white font-medium">{item.maxDiscount.toLocaleString()} VND</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Valid Until:</span>
                        <span className="text-amber-300 font-medium">
                          {new Date(item.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Code Copy Box */}
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
                        {isCopied ? "✓ Copied!" : "Copy Code"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
