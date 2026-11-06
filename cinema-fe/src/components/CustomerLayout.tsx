import { Outlet } from "react-router-dom";
import Navbar from "./home/Navbar";
export default function CustomerLayout() {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  return <><Navbar currentUser={user} onOpenLogin={() => {}} onOpenRegister={() => {}} /><div className="min-h-screen bg-[#0d0d14] pt-32 lg:pt-16"><Outlet /></div></>;
}
