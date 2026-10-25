
export default function Footer() {
  return (
    <footer className="bg-[#07070d] border-t border-white/[0.06] pt-14 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-9 mb-12">
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-[#e8173a] flex items-center justify-center rounded-md">
              <span className="text-white font-extrabold text-base leading-none">N</span>
            </div>
            <span className="font-bold text-sm tracking-wider text-white">NATIONAL CINEMA</span>
          </div>
          <p className="text-xs text-[#606080] leading-relaxed">
            Trung tâm Chiếu phim Quốc gia — điểm đến điện ảnh hàng đầu với hệ thống phòng chiếu hiện đại và âm thanh đỉnh cao.
          </p>
        </div>

        {/* Locations Column */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#a0a0c0] tracking-widest uppercase mb-1">Cụm rạp</p>
          {["Hà Nội - 87 Láng Hạ", "Hồ Chí Minh - Quận 1", "Đà Nẵng - Hải Châu"].map((city) => (
            <a key={city} href="#" className="text-sm text-[#707090] no-underline hover:text-white transition-colors">
              {city}
            </a>
          ))}
        </div>

        {/* Support Column */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#a0a0c0] tracking-widest uppercase mb-1">Hỗ trợ khách hàng</p>
          {["Chính sách đổi trả vé", "Liên hệ & Góp ý", "Câu hỏi thường gặp (FAQ)", "Quy định rạp chiếu"].map((item) => (
            <a key={item} href="#" className="text-sm text-[#707090] no-underline hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* Contact and Hotline */}
        <div>
          <p className="text-xs font-bold text-[#a0a0c0] tracking-widest uppercase mb-3">Tổng đài hỗ trợ</p>
          <p className="text-2xl font-black text-[#e8173a] tracking-tight">1900 6017</p>
          <p className="text-xs text-[#707090] mt-1">8:00 - 22:00 tất cả các ngày trong tuần</p>
          <div className="mt-4 flex gap-3 text-xs text-[#8e8ea8]">
            <span>✉️ cskh@chieuphimquocgia.vn</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/[0.05] text-center pt-6 text-xs text-[#4a4a68]">
        © 2026 Trung tâm Chiếu phim Quốc gia. Tất cả các quyền được bảo lưu.
      </div>
    </footer>
  );
}
