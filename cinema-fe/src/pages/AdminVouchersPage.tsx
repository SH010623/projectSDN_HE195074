import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { voucherService } from "../services/voucherService";
import type { VoucherItem, VoucherPayload } from "../services/voucherService";

export default function AdminVouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VoucherPayload>({
    code: "",
    title: "",
    description: "",
    discountType: "fixed",
    discountValue: 30000,
    minOrderValue: 100000,
    maxDiscount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: 100,
  });
  const [saving, setSaving] = useState(false);

  // Quick test box
  const [testCode, setTestCode] = useState("");
  const [testOrderAmount, setTestOrderAmount] = useState<number>(150000);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const params: any = { all: "true" };
      if (search.trim()) params.search = search.trim();

      const res = await voucherService.getVouchers(params);
      setVouchers(res.vouchers);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load vouchers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      discountType: "fixed",
      discountValue: 30000,
      minOrderValue: 100000,
      maxDiscount: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimit: 100,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VoucherItem) => {
    setEditingId(v._id);
    setFormData({
      code: v.code,
      title: v.title,
      description: v.description || "",
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderValue: v.minOrderValue,
      maxDiscount: v.maxDiscount || 0,
      startDate: v.startDate ? new Date(v.startDate).toISOString().split("T")[0] : "",
      endDate: v.endDate ? new Date(v.endDate).toISOString().split("T")[0] : "",
      usageLimit: v.usageLimit,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await voucherService.updateVoucher(editingId, formData);
        setMessage({ type: "success", text: "Voucher updated successfully" });
      } else {
        await voucherService.createVoucher(formData);
        setMessage({ type: "success", text: "Voucher created successfully" });
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: VoucherItem) => {
    try {
      const res = await voucherService.toggleVoucherStatus(item._id);
      setMessage({ type: "success", text: res.message });
      fetchVouchers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete voucher "${code}"?`)) return;
    try {
      await voucherService.deleteVoucher(id);
      setMessage({ type: "success", text: "Voucher deleted successfully" });
      fetchVouchers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete voucher");
    }
  };

  const handleTestCheck = async () => {
    if (!testCode.trim()) {
      alert("Please enter a voucher code to test");
      return;
    }
    try {
      setTestResult("Checking...");
      const res = await voucherService.checkVoucher({
        code: testCode,
        orderTotal: Number(testOrderAmount) || 0,
      });
      setTestResult(
        `✅ ${res.message}! Discount: -${res.discountAmount.toLocaleString()} VND. Final Total: ${res.finalTotal.toLocaleString()} VND`
      );
    } catch (err: any) {
      setTestResult(`❌ ${err.response?.data?.message || "Voucher test failed"}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white font-inter p-6 sm:p-8">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎟️</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Voucher & Promotion Management</h1>
            </div>
            <p className="text-[#a0a0b0] text-sm mt-1">Configure discount codes, limits, and promotional vouchers</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer border-0 shadow-lg shadow-red-950/40"
            >
              + Create Voucher
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 bg-[#161626] border border-white/10 hover:border-white/20 text-[#a0a0b0] hover:text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm border ${
              message.type === "success"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search & Voucher Test Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#161626] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="Search by voucher code or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e8173a]/60"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer border-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Sandbox Tester */}
          <div className="bg-[#161626] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-[#f87083]">⚡ Quick Voucher Tester</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Code (e.g. CINEMA50)"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                className="w-1/2 px-3 py-1.5 bg-[#0d0d14] border border-white/10 rounded-lg text-xs uppercase font-mono"
              />
              <input
                type="number"
                placeholder="Order total"
                value={testOrderAmount}
                onChange={(e) => setTestOrderAmount(Number(e.target.value))}
                className="w-1/2 px-3 py-1.5 bg-[#0d0d14] border border-white/10 rounded-lg text-xs"
              />
              <button
                onClick={handleTestCheck}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer border-0"
              >
                Check
              </button>
            </div>
            {testResult && <p className="text-[0.75rem] text-[#c4b5fd] mt-2 line-clamp-2">{testResult}</p>}
          </div>
        </div>

        {/* Vouchers Table */}
        <div className="bg-[#161626] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#a0a0b0] font-medium text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Code & Title</th>
                  <th className="py-4 px-4">Discount</th>
                  <th className="py-4 px-4">Min Order</th>
                  <th className="py-4 px-4">Usage</th>
                  <th className="py-4 px-4">Validity</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#a0a0b0]">
                      Loading vouchers...
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#a0a0b0]">
                      No vouchers found. Click "+ Create Voucher" to add one.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((item) => {
                    const isExpired = new Date(item.endDate) < new Date();
                    return (
                      <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs tracking-wider rounded-lg">
                              {item.code}
                            </span>
                            <div>
                              <h3 className="font-semibold text-white leading-tight">{item.title}</h3>
                              {item.description && (
                                <p className="text-xs text-[#a0a0b0] line-clamp-1 mt-0.5">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-[#86efac]">
                            {item.discountType === "percentage"
                              ? `${item.discountValue}% OFF`
                              : `-${item.discountValue.toLocaleString()} VND`}
                          </span>
                          {item.discountType === "percentage" && item.maxDiscount > 0 && (
                            <span className="text-[0.7rem] text-[#9ca3af] block">
                              (Max: {item.maxDiscount.toLocaleString()} VND)
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-[#d1d5db]">
                          {item.minOrderValue > 0 ? `${item.minOrderValue.toLocaleString()} VND` : "No minimum"}
                        </td>

                        <td className="py-4 px-4 text-[#d1d5db]">
                          <span className="font-medium text-white">{item.usedCount}</span>
                          <span className="text-xs text-[#6b7280]"> / {item.usageLimit || "∞"}</span>
                        </td>

                        <td className="py-4 px-4 text-xs text-[#a0a0b0]">
                          <span className={isExpired ? "text-rose-400 font-semibold" : ""}>
                            {new Date(item.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {isExpired && <span className="block text-[0.68rem] text-rose-400">Expired</span>}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              !item.isActive
                                ? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                                : isExpired
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {!item.isActive ? "○ Disabled" : isExpired ? "● Expired" : "● Active"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-[#c4b5fd] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                item.isActive
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                              }`}
                            >
                              {item.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => handleDelete(item._id, item.code)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161626] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-[580px] w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <span>{editingId ? "✏️ Edit Voucher" : "🎟️ Create New Voucher"}</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Voucher Code (*)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MOVIE50"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white font-mono uppercase text-sm focus:outline-none focus:border-[#e8173a]/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    >
                      <option value="fixed">Fixed Amount (VND)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Voucher Title (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50,000 VND off on weekend tickets"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">
                      {formData.discountType === "percentage" ? "Percentage (1 - 100%)" : "Discount Amount (VND)"} (*)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formData.discountType === "percentage" ? 100 : 10000000}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Min Order Value (VND)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Max Discount Cap (0 = No cap)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Expiration Date (*)</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Terms, conditions, or applicable movie categories..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-transparent border border-white/20 hover:border-white/40 text-[#a0a0b0] hover:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer border-0"
                  >
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Create Voucher"}
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
