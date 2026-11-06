import AppSelect from "../components/AppSelect";
import React, { useEffect, useState } from "react";
import { adminUserService } from "../services/adminUserService";
import type { UserProfile } from "../services/profileService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal edit role
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");

  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await adminUserService.getUsers(params);
      setUsers(res.users);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách tài khoản",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (user._id === currentUser?._id) {
      alert("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const actionText = user.isActive !== false ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.name}"?`)) {
      return;
    }

    try {
      const res = await adminUserService.toggleUserStatus(user._id);
      setMessage({ type: "success", text: res.message });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Thao tác thất bại",
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      const res = await adminUserService.updateUser(editingUser._id, { role: selectedRole });
      setMessage({ type: "success", text: res.message });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cập nhật quyền thất bại");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 700 }}>Quản trị Tài khoản người dùng</h1>
            <p style={{ color: "#a0a0b0", margin: "0.4rem 0 0" }}>Phân quyền và quản lý trạng thái tài khoản (Soft Delete / Inactive)</p>
          </div>

        </div>

        {/* Thông báo */}
        {message && (
          <div
            style={{
              padding: "0.8rem 1rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              background: message.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: message.type === "success" ? "#86efac" : "#fca5a5",
              border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Thanh tìm kiếm & Lọc */}
        <div style={{ background: "#161626", borderRadius: "14px", padding: "1rem", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", flex: "1 1 300px" }}>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: "0.6rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff" }}
            />
            <button
              type="submit"
              style={{ padding: "0.6rem 1.2rem", background: "#6366f1", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
            >
              Tìm
            </button>
          </form>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <AppSelect label="Vai trò" value={roleFilter || ""} onValueChange={value => setRoleFilter(value)} options={[{"value": "all", "label": "Tất cả vai trò"}, {"value": "user", "label": "Khách hàng"}, {"value": "admin", "label": "Quản trị viên"}]} />

            <AppSelect label="Trạng thái" value={statusFilter || ""} onValueChange={value => setStatusFilter(value)} options={[{"value": "all", "label": "Tất cả trạng thái"}, {"value": "active", "label": "Đang hoạt động"}, {"value": "inactive", "label": "Đã bị khóa"}]} />
          </div>
        </div>

        {/* Bảng danh sách tài khoản */}
        <div style={{ background: "#161626", borderRadius: "16px", overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", color: "#a0a0b0" }}>
                <th style={{ padding: "1rem" }}>Người dùng</th>
                <th style={{ padding: "1rem" }}>Số điện thoại</th>
                <th style={{ padding: "1rem" }}>Vai trò</th>
                <th style={{ padding: "1rem" }}>Trạng thái</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#a0a0b0" }}>Đang tải danh sách...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#a0a0b0" }}>Không tìm thấy tài khoản nào</td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = u.isActive !== false;
                  const isCurrent = u._id === currentUser?._id;

                  return (
                    <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>
                          {u.name} {isCurrent && <span style={{ fontSize: "0.75rem", color: "#c4b5fd" }}>(Bạn)</span>}
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "1rem", color: "#d1d5db" }}>{u.phone || "—"}</td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            background: u.role === "admin" ? "rgba(236,72,153,0.15)" : "rgba(59,130,246,0.15)",
                            color: u.role === "admin" ? "#f472b6" : "#60a5fa",
                            border: `1px solid ${u.role === "admin" ? "rgba(236,72,153,0.3)" : "rgba(59,130,246,0.3)"}`,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            background: isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                            color: isActive ? "#86efac" : "#fca5a5",
                            border: `1px solid ${isActive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                          }}
                        >
                          {isActive ? "● Hoạt động" : "○ Đã khóa"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedRole(u.role as "user" | "admin");
                          }}
                          style={{
                            padding: "0.4rem 0.8rem",
                            marginRight: "0.5rem",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#c4b5fd",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          Đổi quyền
                        </button>

                        <button
                          disabled={isCurrent}
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            background: isActive ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                            border: `1px solid ${isActive ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                            color: isActive ? "#fca5a5" : "#86efac",
                            borderRadius: "6px",
                            cursor: isCurrent ? "not-allowed" : "pointer",
                            opacity: isCurrent ? 0.5 : 1,
                            fontSize: "0.85rem",
                          }}
                        >
                          {isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Đổi Role */}
        {editingUser && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
            <div style={{ background: "#1a1a2e", borderRadius: "16px", padding: "1.8rem", width: "90%", maxWidth: "420px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1.2rem" }}>Phân quyền cho: {editingUser.name}</h3>
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: "0 0 1.2rem" }}>Email: {editingUser.email}</p>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#d1d5db" }}>Chọn vai trò (Role):</label>
                <AppSelect label="Vai trò" value={selectedRole || ""} onValueChange={value => setSelectedRole(value as "user" | "admin")} options={[{"value": "user", "label": "User (Khách hàng thông thường)"}, {"value": "admin", "label": "Admin (Quản trị viên toàn hệ thống)"}]} fullWidth />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#9ca3af", borderRadius: "8px", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateRole}
                  style={{ padding: "0.6rem 1.2rem", background: "#7c3aed", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
