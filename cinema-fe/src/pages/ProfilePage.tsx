import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../services/profileService";
import type { UserProfile } from "../services/profileService";

export default function ProfilePage() {
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0f0f1a", color: "#fff" }}>
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 700 }}>👤 Hồ sơ cá nhân</h1>
            <p style={{ color: "#a0a0b0", margin: "0.4rem 0 0" }}>Quản lý thông tin tài khoản và bảo mật của bạn</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "0.6rem 1.2rem",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            ← Về Dashboard
          </button>
        </div>

        {/* Grid 2 Cột */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {/* Cột 1: Thông tin cá nhân */}
          <div style={{ background: "#161626", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0, marginBottom: "1.2rem", color: "#c4b5fd" }}>Thông tin tài khoản</h2>
            
            {profileMsg && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  background: profileMsg.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: profileMsg.type === "success" ? "#86efac" : "#fca5a5",
                  border: `1px solid ${profileMsg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Email (Không thể sửa)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#6b7280", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Họ và tên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ của bạn"
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>

          {/* Cột 2: Đổi mật khẩu */}
          <div style={{ background: "#161626", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0, marginBottom: "1.2rem", color: "#c4b5fd" }}>Đổi mật khẩu</h2>

            {passwordMsg && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  background: passwordMsg.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: passwordMsg.type === "success" ? "#86efac" : "#fca5a5",
                  border: `1px solid ${passwordMsg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Mật khẩu mới (≥ 6 ký tự)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {savingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
