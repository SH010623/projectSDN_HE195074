import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0c0d1c] text-[#e2e8f0] font-inter flex flex-col md:flex-row">
      {/* ── Persistent Dynamic Sidebar on the Left ── */}
      <AdminSidebar />

      {/* ── Dynamic Content on the Right ── */}
      <div className="flex-1 min-w-0 overflow-y-auto min-h-screen bg-[#0c0d1c]">
        <Outlet />
      </div>
    </div>
  );
}

