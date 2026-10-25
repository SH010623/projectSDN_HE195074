import React from "react";

interface NavbarProps {
  currentUser: { name?: string; role?: string } | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoToDashboard: () => void;
}

// Navigation links list
const NAV_LINKS = [
  { id: "nav-home", label: "Trang chủ", href: "/", active: true },
  { id: "nav-schedule", label: "Lịch chiếu", href: "#schedule" },
  { id: "nav-news", label: "Tin tức", href: "#news" },
  { id: "nav-promotions", label: "Khuyến mãi", href: "#promotions" },
  { id: "nav-tickets", label: "Giá vé", href: "#tickets" },
  { id: "nav-festival", label: "Liên hoan phim", href: "#festival" },
  { id: "nav-about", label: "Giới thiệu", href: "#about" },
];

export default function Navbar({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onGoToDashboard,
}: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-6">
        {/* Brand Logo */}
        <a href="/" id="navbar-logo" className="flex items-center gap-2.5 shrink-0 no-underline">
          <div className="w-9 h-9 bg-[#e8173a] flex items-center justify-center rounded-md">
            <span className="text-white font-extrabold text-lg leading-none">N</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-[0.72rem] tracking-[0.1em]">NATIONAL</span>
            <span className="text-[#8888a0] text-[0.6rem] tracking-[0.08em]">CINEMA CENTER</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              className={`px-3 py-1.5 text-[0.82rem] font-medium rounded-md whitespace-nowrap no-underline transition-colors ${
                link.active
                  ? "text-white border-b-2 border-[#e8173a]"
                  : "text-[#9090b0] hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Authentication or User Profile Actions */}
        {currentUser ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-[#a0a0c0] hidden sm:inline">
              Xin chào, <strong className="text-white">{currentUser.name || "Khách"}</strong>
            </span>
            <button
              onClick={onGoToDashboard}
              className="px-4 py-1.5 bg-[#e8173a] rounded-md text-white text-sm font-semibold hover:bg-[#c91131] transition-colors cursor-pointer border-0 flex items-center gap-1.5"
            >
              <span>🎬</span> Bảng điều khiển
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="nav-register-btn"
              onClick={onOpenRegister}
              className="px-4 py-1.5 bg-transparent border border-white/25 rounded-md text-[#d0d0e0] text-sm font-medium hover:border-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Đăng ký
            </button>
            <button
              id="nav-login-btn"
              onClick={onOpenLogin}
              className="px-4 py-1.5 bg-[#e8173a] rounded-md text-white text-sm font-semibold hover:bg-[#c91131] transition-colors cursor-pointer border-0"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
