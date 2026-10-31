import React, { useEffect, useState } from "react";
import { profileService } from "../services/profileService";
import type { UserProfile } from "../services/profileService";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.user);
      setName(res.user.name || "");
      setPhone(res.user.phone || "");
      setAddress(res.user.address || "");
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Không thể tải thông tin cá nhân",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!name.trim()) {
      setProfileMsg({ type: "error", text: "Vui lòng nhập họ và tên." });
      return;
    }
    try {
      setSavingProfile(true);
      const res = await profileService.updateProfile({ name, phone, address });
      setProfile(res.user);
      // Cập nhật lại localStorage user
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        localStorage.setItem("user", JSON.stringify({ ...u, name: res.user.name, phone: res.user.phone }));
      }
      setProfileMsg({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Cập nhật thất bại",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "error", text: "Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Mật khẩu mới phải từ 6 ký tự trở lên!" });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await profileService.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: "success", text: res.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Đổi mật khẩu thất bại",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "mt-2 w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3.5 py-3 text-sm text-white placeholder:text-[#626274] outline-none transition-colors focus:border-[#e8173a] focus:ring-2 focus:ring-[#e8173a]/15 disabled:cursor-not-allowed disabled:text-[#858597]";
  const labelClass = "block text-sm font-medium text-[#c4c4d0]";
  const notice = (message: { type: "success" | "error"; text: string } | null) => message && (
    <p role={message.type === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${message.type === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}`}>{message.text}</p>
  );

  if (loading) return <main aria-busy="true" className="mx-auto max-w-6xl px-6 py-12"><p role="status" className="text-gray-400">Đang tải hồ sơ cá nhân...</p><div className="mt-8 h-96 animate-pulse rounded-2xl bg-white/5" /></main>;

  if (!profile) return <main className="mx-auto max-w-6xl px-6 py-12"><h1 className="mb-6 text-3xl font-bold">Hồ sơ cá nhân</h1>{notice(profileMsg)}<button onClick={fetchProfile} className="mt-5 rounded-lg bg-[#e8173a] px-5 py-2.5 font-semibold">Thử lại</button></main>;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12 text-white">
      <header className="mb-8 border-b border-white/10 pb-8">
        <p className="mb-3 text-xs font-semibold tracking-widest text-[#9292a5]">TÀI KHOẢN CỦA BẠN</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="mt-3 text-sm leading-6 text-[#9292a5]">Cập nhật thông tin liên hệ và quản lý mật khẩu của bạn.</p>
      </header>

      <div className="mb-8 flex items-center gap-4">
        <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#e8173a]/25 bg-[#e8173a]/10 text-xl font-bold text-rose-300">{(profile.name || "K").trim().charAt(0).toUpperCase()}</div>
        <div className="min-w-0"><p className="font-semibold text-lg break-words">{profile.name}</p><p className="mt-1 text-sm text-[#9292a5] break-all">{profile.email}</p></div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="profile-heading" className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#15151f] p-6 sm:p-8">
          <h2 id="profile-heading" className="text-xl font-semibold tracking-tight">Thông tin cá nhân</h2>
          <p className="mt-2 mb-7 text-sm leading-6 text-[#9292a5]">Thông tin dùng để liên hệ và hỗ trợ đặt vé.</p>
          <form noValidate onSubmit={handleUpdateProfile} className="space-y-5">
            {notice(profileMsg)}
            <label className={labelClass}>Địa chỉ email<input type="email" autoComplete="email" disabled value={profile.email} className={inputClass} /><span className="mt-2 block text-xs font-normal text-[#858597]">Email đăng nhập không thể thay đổi.</span></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Họ và tên <span className="text-rose-400">*</span><input type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} className={inputClass} /></label>
              <label className={labelClass}>Số điện thoại<input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} /></label>
            </div>
            <label className={labelClass}>Địa chỉ<input type="text" autoComplete="street-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Nhập địa chỉ của bạn" className={inputClass} /></label>
            <div className="border-t border-white/[0.08] pt-5 flex justify-end"><button type="submit" disabled={savingProfile} className="w-full sm:w-auto rounded-lg bg-[#e8173a] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#c91131] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-400 disabled:opacity-50">{savingProfile ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
          </form>
        </section>

        <section aria-labelledby="password-heading" className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#15151f] p-6 sm:p-8">
          <h2 id="password-heading" className="text-xl font-semibold tracking-tight">Đổi mật khẩu</h2>
          <p className="mt-2 mb-7 text-sm leading-6 text-[#9292a5]">Sử dụng mật khẩu riêng để bảo vệ tài khoản.</p>
          <form noValidate onSubmit={handleChangePassword} className="space-y-5">
            {notice(passwordMsg)}
            <label className={labelClass}>Mật khẩu hiện tại<input type="password" autoComplete="current-password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Mật khẩu mới<input type="password" autoComplete="new-password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} /><span className="mt-2 block text-xs font-normal text-[#858597]">Sử dụng ít nhất 6 ký tự.</span></label>
            <label className={labelClass}>Xác nhận mật khẩu mới<input type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} /></label>
            <div className="border-t border-white/[0.08] pt-5"><button type="submit" disabled={savingPassword} className="w-full rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/10 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-400 disabled:opacity-50">{savingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</button></div>
          </form>
        </section>
      </div>
    </main>
  );
}
