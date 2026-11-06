import AppSelect from "../components/AppSelect";
import React, { useEffect, useState } from "react";
import { roomService } from "../services/roomService";
import type { Room, RoomPayload } from "../services/roomService";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal Add / Edit room
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoomPayload>({
    name: "",
    roomType: "2D",
    rows: 5,
    seatsPerRow: 10,
    totalSeats: 50,
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [typeFilter, statusFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== "all") params.roomType = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await roomService.getRooms(params);
      setRooms(res.rooms);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách phòng chiếu",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRoomId(null);
    setFormData({
      name: "",
      roomType: "2D",
      rows: 5,
      seatsPerRow: 10,
      totalSeats: 50,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoomId(room._id);
    setFormData({
      name: room.name,
      roomType: room.roomType,
      rows: room.rows,
      seatsPerRow: room.seatsPerRow,
      totalSeats: room.totalSeats,
      description: room.description || "",
    });
    setIsModalOpen(true);
  };

  const handleRowsOrSeatsChange = (rows: number, seatsPerRow: number) => {
    setFormData((prev) => ({
      ...prev,
      rows,
      seatsPerRow,
      totalSeats: rows * seatsPerRow,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingRoomId) {
        await roomService.updateRoom(editingRoomId, formData);
        setMessage({ type: "success", text: "Cập nhật thông tin phòng thành công!" });
      } else {
        await roomService.createRoom(formData);
        setMessage({ type: "success", text: "Tạo phòng chiếu mới thành công!" });
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi lưu phòng chiếu");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: "active" | "inactive" | "maintenance") => {
    try {
      const res = await roomService.updateRoomStatus(roomId, newStatus);
      setMessage({ type: "success", text: res.message });
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái phòng");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 700 }}>Quản lý Phòng chiếu (Cinema Rooms)</h1>
            <p style={{ color: "#a0a0b0", margin: "0.4rem 0 0" }}>Quản lý phòng chiếu, sơ đồ ghế và trạng thái hoạt động (Soft Delete / Bảo trì)</p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.6rem 1.2rem",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                border: "none",
                color: "#fff",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Thêm phòng mới
            </button>

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

        {/* Lọc */}
        <div style={{ background: "#161626", borderRadius: "14px", padding: "1rem", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginRight: "0.5rem" }}>Loại phòng:</label>
            <AppSelect label="Định dạng" value={typeFilter || ""} onValueChange={value => setTypeFilter(value)} options={[{"value": "all", "label": "Tất cả các loại"}, {"value": "2D", "label": "2D"}, {"value": "3D", "label": "3D"}, {"value": "IMAX", "label": "IMAX"}, {"value": "4DX", "label": "4DX"}, {"value": "VIP", "label": "VIP"}]} />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginRight: "0.5rem" }}>Trạng thái:</label>
            <AppSelect label="Trạng thái" value={statusFilter || ""} onValueChange={value => setStatusFilter(value)} options={[{"value": "all", "label": "Tất cả trạng thái"}, {"value": "active", "label": "Đang hoạt động"}, {"value": "inactive", "label": "Ngừng hoạt động"}, {"value": "maintenance", "label": "Đang bảo trì"}]} />
          </div>
        </div>

        {/* Danh sách phòng */}
        <div style={{ background: "#161626", borderRadius: "16px", overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", minWidth: "1040px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", color: "#a0a0b0" }}>
                <th style={{ whiteSpace: "nowrap", padding: "1rem" }}>Tên phòng</th>
                <th style={{ whiteSpace: "nowrap", padding: "1rem" }}>Định dạng</th>
                <th style={{ whiteSpace: "nowrap", padding: "1rem" }}>Sức chứa (Ghế)</th>
                <th style={{ whiteSpace: "nowrap", padding: "1rem" }}>Cấu hình</th>
                <th style={{ whiteSpace: "nowrap", padding: "1rem" }}>Trạng thái</th>
                <th style={{ whiteSpace: "nowrap", padding: "1rem", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#a0a0b0" }}>Đang tải danh sách phòng...</td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#a0a0b0" }}>Chưa có phòng chiếu nào</td>
                </tr>
              ) : (
                rooms.map((r) => {
                  const statusColors = {
                    active: { bg: "rgba(34,197,94,0.15)", color: "#86efac", border: "rgba(34,197,94,0.3)", text: "● Hoạt động" },
                    inactive: { bg: "rgba(107,114,128,0.2)", color: "#9ca3af", border: "rgba(107,114,128,0.4)", text: "○ Ngừng hoạt động" },
                    maintenance: { bg: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "rgba(245,158,11,0.3)", text: "▲ Bảo trì" },
                  };
                  const currentSt = statusColors[r.status] || statusColors.active;

                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{r.name}</div>
                        {r.description && <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{r.description}</div>}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            whiteSpace: "nowrap",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            background: "rgba(139,92,246,0.15)",
                            color: "#c4b5fd",
                            border: "1px solid rgba(139,92,246,0.3)",
                          }}
                        >
                          {r.roomType}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", whiteSpace: "nowrap", color: "#e5e7eb", fontWeight: 600 }}>{r.totalSeats} ghế</td>
                      <td style={{ padding: "1rem", whiteSpace: "nowrap", color: "#9ca3af" }}>
                        {r.rows} hàng × {r.seatsPerRow} ghế/hàng
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            whiteSpace: "nowrap",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            background: currentSt.bg,
                            color: currentSt.color,
                            border: `1px solid ${currentSt.border}`,
                          }}
                        >
                          {currentSt.text}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#c4b5fd",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          Sửa
                        </button>

                        <AppSelect label="Trạng thái" value={r.status || ""} onValueChange={value => handleStatusChange(r._id, value as any)} options={[{"value": "active", "label": "Hoạt động"}, {"value": "inactive", "label": "Ngừng hoạt động"}, {"value": "maintenance", "label": "Bảo trì"}]} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Thêm / Sửa Phòng */}
        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
            <div style={{ background: "#1a1a2e", borderRadius: "16px", padding: "1.8rem", width: "90%", maxWidth: "480px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <h3 style={{ margin: "0 0 1.2rem", fontSize: "1.3rem" }}>
                {editingRoomId ? "Chỉnh sửa phòng chiếu" : "Thêm phòng chiếu mới"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Tên phòng chiếu (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phòng 01, IMAX Theatre..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Định dạng phòng chiếu</label>
                  <AppSelect label="Định dạng" value={formData.roomType || ""} onValueChange={value => setFormData({ ...formData, roomType: value as any })} options={[{"value": "2D", "label": "2D (Tiêu chuẩn)"}, {"value": "3D", "label": "3D (Không gian 3 chiều)"}, {"value": "IMAX", "label": "IMAX (Màn hình lớn siêu nét)"}, {"value": "4DX", "label": "4DX (Rung lắc, hiệu ứng chuyển động)"}, {"value": "VIP", "label": "VIP (Ghế sofa da cao cấp)"}]} fullWidth />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Số hàng ghế</label>
                    <input
                      type="number"
                      min={1}
                      max={26}
                      value={formData.rows || 5}
                      onChange={(e) => handleRowsOrSeatsChange(Number(e.target.value), formData.seatsPerRow || 10)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Số ghế / hàng</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.seatsPerRow || 10}
                      onChange={(e) => handleRowsOrSeatsChange(formData.rows || 5, Number(e.target.value))}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Tổng số ghế</label>
                  <input
                    type="number"
                    disabled
                    value={formData.totalSeats || 50}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#c4b5fd", fontWeight: 700, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.4rem" }}>Mô tả ngắn</label>
                  <input
                    type="text"
                    placeholder="Mô tả hoặc ghi chú..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#9ca3af", borderRadius: "8px", cursor: "pointer" }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: "0.6rem 1.2rem", background: "#7c3aed", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                  >
                    {saving ? "Đang lưu..." : editingRoomId ? "Cập nhật" : "Tạo phòng"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
