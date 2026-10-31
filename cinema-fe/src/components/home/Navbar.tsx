import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  currentUser: { name?: string; role?: string } | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoToDashboard?: () => void;
}

export default function Navbar({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onGoToDashboard,
}: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    };
    if (!accountOpen) return;
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  const goToAccountPage = (path: string) => {
    setAccountOpen(false);
    navigate(path);
  };

  // Dynamically configure nav links and active state based on route
  const isHomePage = currentPath === "/";
  const isNewsPage = currentPath.startsWith("/news");
  const isVouchersPage = currentPath.startsWith("/vouchers");
  const isTicketsPage = currentPath.startsWith("/tickets");

  const navLinks = [
    {
      id: "nav-home",
      label: "Trang chủ",
      href: "/",
      active: isHomePage,
    },
    {
      id: "nav-schedule",
      label: "Lịch chiếu",
      href: "/schedule",
      active: currentPath === "/schedule",
    },
    {
      id: "nav-news",
      label: "Tin tức",
      href: "/news",
      active: isNewsPage,
    },
    {
      id: "nav-promotions",
      label: "Khuyến mãi",
      href: "/vouchers",
      active: isVouchersPage,
    },
    {
      id: "nav-tickets",
      label: "Giá vé",
      href: "/tickets",
      active: isTicketsPage,
    },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // If it's a direct route without hash (like / or /news or /vouchers or /tickets), navigate smoothly with router
    if (href.startsWith("/") && !href.includes("#")) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 min-h-16 py-3 flex flex-wrap items-center gap-3">
        {/* Brand Logo */}
        <a
          href="/"
          id="navbar-logo"
          onClick={(e) => handleNavClick(e, "/")}
          className="flex items-center gap-2.5 shrink-0 no-underline"
        >
          <div className="w-9 h-9 bg-[#e8173a] flex items-center justify-center rounded-md">
            <span className="text-white font-extrabold text-lg leading-none">N</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-[0.72rem] tracking-[0.1em]">NATIONAL</span>
            <span className="text-[#8888a0] text-[0.6rem] tracking-[0.08em]">CINEMA CENTER</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="flex items-center justify-center gap-2 lg:gap-6 flex-1 overflow-x-auto">
          {navLinks.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
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
          <div ref={accountRef} className="relative shrink-0" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setAccountOpen(false);
          }}>
            <button
              ref={accountButtonRef}
              type="button"
              aria-expanded={accountOpen}
              aria-controls="account-dropdown"
              onClick={() => setAccountOpen(open => !open)}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span><span className="text-[#a0a0c0]">Xin chào, </span><strong>{currentUser.name || "Khách"}</strong></span>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${accountOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {accountOpen && (
              <div id="account-dropdown" className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#161620] p-1.5 shadow-xl">
                {currentUser.role === "admin" ? (
                  <button type="button" onClick={() => { setAccountOpen(false); if (onGoToDashboard) onGoToDashboard(); else navigate("/admin/dashboard"); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 cursor-pointer">Trang quản trị</button>
                ) : (
                  <>
                    <button type="button" onClick={() => goToAccountPage("/my-tickets")} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 cursor-pointer">Vé của tôi</button>
                    <button type="button" onClick={() => goToAccountPage("/profile")} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 cursor-pointer">Hồ sơ</button>
                  </>
                )}
                <div className="my-1 border-t border-white/10" />
                <button type="button" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.assign("/"); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer">Đăng xuất</button>
              </div>
            )}
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
