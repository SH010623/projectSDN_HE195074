import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/home/Navbar";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import Footer from "../components/home/Footer";

type ModalState = "none" | "login" | "register" | "forgotPassword";

export default function TicketsPage() {
  const navigate = useNavigate();

  // Authentication modals
  const [modal, setModal] = useState<ModalState>("none");
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white font-inter flex flex-col justify-between">
      {/* ── 1. NAVBAR GỐC ── */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setModal("login")}
        onOpenRegister={() => setModal("register")}
        onGoToDashboard={() => navigate("/dashboard")}
      />

      {/* ── 2. MAIN CONTENT ── */}
      <main className="max-w-[1240px] mx-auto px-6 pt-24 pb-16 w-full flex-1">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-xs text-rose-400 font-semibold mb-3">
            <span>🎟️</span>
            <span>Trung Tâm Chiếu Phim Quốc Gia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Bảng Giá Vé <span className="text-[#e8173a]">Tiêu Chuẩn</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a0a0b0]">
            Áp dụng cho tất cả các suất chiếu phim 2D, 3D, phòng chiếu VIP và màn hình công nghệ IMAX Laser.
          </p>
        </div>

        {/* ── SECTION 1: BẢNG GIÁ PHIM 2D TIÊU CHUẨN ── */}
        <div className="bg-[#161626] border border-white/[0.08] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-xl text-rose-400 font-bold">
                2D
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Bảng Giá Vé Phim 2D Kỹ Thuật Số</h2>
                <p className="text-xs text-[#8e8ea0]">Định dạng tiêu chuẩn âm thanh vòm kỹ thuật số</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
              Phổ biến nhất
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#a0a0b0] font-medium text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Khung Giờ Chiếu</th>
                  <th className="py-3 px-4">Thứ 2 - Thứ 5</th>
                  <th className="py-3 px-4 text-rose-300">Thứ 6, Thứ 7, CN & Ngày Lễ</th>
                  <th className="py-3 px-4 text-amber-300">HSSV / Trẻ Em / U22 (*)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-medium text-white">
                    Buổi sáng (Trước 12:00)
                  </td>
                  <td className="py-4 px-4 text-[#86efac] font-bold">75.000 VNĐ</td>
                  <td className="py-4 px-4 text-white font-semibold">85.000 VNĐ</td>
                  <td className="py-4 px-4 text-amber-300 font-medium">55.000 VNĐ</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-medium text-white">
                    Buổi chiều (12:00 - 17:00)
                  </td>
                  <td className="py-4 px-4 text-[#86efac] font-bold">80.000 VNĐ</td>
                  <td className="py-4 px-4 text-white font-semibold">90.000 VNĐ</td>
                  <td className="py-4 px-4 text-amber-300 font-medium">60.000 VNĐ</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-medium text-white">
                    Giờ vàng buổi tối (Sau 17:00)
                  </td>
                  <td className="py-4 px-4 text-[#86efac] font-bold">85.000 VNĐ</td>
                  <td className="py-4 px-4 text-rose-400 font-bold">95.000 VNĐ</td>
                  <td className="py-4 px-4 text-amber-300 font-medium">65.000 VNĐ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 2: BẢNG GIÁ ĐỊNH DẠNG ĐẶC BIỆT & PHỤ THU ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Định dạng 3D & IMAX */}
          <div className="bg-[#161626] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.08]">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-300 font-bold">
                  3D
                </span>
                <div>
                  <h3 className="font-bold text-lg text-white">Phim 3D & IMAX Laser</h3>
                  <p className="text-xs text-[#8e8ea0]">Trải nghiệm hình ảnh và âm thanh sống động</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Vé phim 3D Kỹ thuật số</div>
                    <div className="text-xs text-[#8e8ea0]">Kính 3D chất lượng cao miễn phí</div>
                  </div>
                  <span className="font-bold text-cyan-300">+ 15.000 VNĐ</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Phòng chiếu IMAX Laser</div>
                    <div className="text-xs text-[#8e8ea0]">Màn hình siêu lớn cong & âm thanh 12 kênh</div>
                  </div>
                  <span className="font-bold text-rose-400">+ 35.000 VNĐ</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Phòng VIP Luxury</div>
                    <div className="text-xs text-[#8e8ea0]">Ghế nệm sofa da chỉnh điện cao cấp</div>
                  </div>
                  <span className="font-bold text-amber-300">+ 50.000 VNĐ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Phụ thu ghế ngồi */}
          <div className="bg-[#161626] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.08]">
                <span className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 font-bold">
                  👑
                </span>
                <div>
                  <h3 className="font-bold text-lg text-white">Phụ Thu Ghế VIP & Ghế Đôi</h3>
                  <p className="text-xs text-[#8e8ea0]">Lựa chọn vị trí ngồi đẹp nhất khán phòng</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Ghế VIP (Hàng giữa rạp)</div>
                    <div className="text-xs text-[#8e8ea0]">Tầm nhìn trọn vẹn, không mỏi mắt</div>
                  </div>
                  <span className="font-bold text-amber-300">+ 15.000 VNĐ/ghế</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Ghế đôi Sweetbox (Hàng cuối)</div>
                    <div className="text-xs text-[#8e8ea0]">Không gian riêng tư cho cặp đôi</div>
                  </div>
                  <span className="font-bold text-[#f87083]">200.000 VNĐ/cặp</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Thứ 4 Vui Vẻ (Happy Day)</div>
                    <div className="text-xs text-[#8e8ea0]">Đồng giá mọi suất chiếu 2D ghế thường</div>
                  </div>
                  <span className="font-bold text-emerald-400">Đồng giá 60.000 VNĐ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: QUY ĐỊNH & ĐỐI TƯỢNG ƯU TIÊN ── */}
        <div className="bg-gradient-to-r from-[#161626] via-[#1a1730] to-[#161626] border border-white/10 rounded-2xl p-6 sm:p-8 mb-12 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Quy định & Chính sách đối tượng ưu tiên</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-[#c0c0d8] leading-relaxed">
            <div className="bg-[#0d0d14]/70 p-4 rounded-xl border border-white/[0.06]">
              <h4 className="font-semibold text-white mb-1">🎓 Học sinh, Sinh viên & U22:</h4>
              <p>
                Áp dụng cho học sinh, sinh viên có thẻ HSSV còn hạn hoặc khách hàng dưới 22 tuổi xuất trình CCCD khi mua vé hoặc nhận vé tại quầy.
              </p>
            </div>

            <div className="bg-[#0d0d14]/70 p-4 rounded-xl border border-white/[0.06]">
              <h4 className="font-semibold text-white mb-1">👶 Trẻ em & Người cao tuổi:</h4>
              <p>
                Trẻ em chiều cao dưới 1.3m và người cao tuổi từ 60 tuổi trở lên được hưởng mức giá ưu đãi đồng giá 50.000 VNĐ cho các suất chiếu 2D trước 17:00.
              </p>
            </div>

            <div className="bg-[#0d0d14]/70 p-4 rounded-xl border border-white/[0.06]">
              <h4 className="font-semibold text-white mb-1">📌 Lưu ý quan trọng:</h4>
              <p>
                Giá vé đã bao gồm thuế VAT. Không áp dụng đồng thời với các chương trình khuyến mãi khác. Vé đã mua trực tuyến có thể hủy trước giờ chiếu 60 phút.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: CALL TO ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <button
            onClick={() => navigate("/#schedule")}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#e8173a] hover:bg-[#c91131] rounded-xl text-white text-sm font-bold shadow-lg shadow-red-950/40 transition-all cursor-pointer border-0"
          >
            🎬 Xem Lịch Chiếu & Đặt Vé Ngay
          </button>
          <button
            onClick={() => navigate("/vouchers")}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#161626] hover:bg-[#202038] border border-white/15 rounded-xl text-emerald-300 text-sm font-semibold transition-all cursor-pointer"
          >
            🎟️ Săn Voucher Giảm Giá Vé
          </button>
        </div>
      </main>

      {/* ── 3. FOOTER ── */}
      <Footer />

      {/* ── 4. AUTH MODALS ── */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal("none")}
          onSuccess={(u) => {
            setModal("none");
            if (u?.role === "admin") navigate("/dashboard");
          }}
          onSwitchToRegister={() => setModal("register")}
          onSwitchToForgotPassword={() => setModal("forgotPassword")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
      {modal === "forgotPassword" && (
        <ForgotPasswordModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </div>
  );
}

