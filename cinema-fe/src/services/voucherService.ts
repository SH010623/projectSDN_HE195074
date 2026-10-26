import apiClient from "./apiClient";

export interface VoucherItem {
  _id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherPayload {
  code: string;
  title: string;
  description?: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate: string;
  usageLimit?: number;
  isActive?: boolean;
}

export const voucherService = {
  getVouchers: async (params?: { all?: string; search?: string }) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      vouchers: VoucherItem[];
    }>("/vouchers", { params });
    return res.data;
  },

  getVoucherById: async (id: string) => {
    const res = await apiClient.get<{ message: string; voucher: VoucherItem }>(
      `/vouchers/${id}`
    );
    return res.data;
  },

  createVoucher: async (payload: VoucherPayload) => {
    const res = await apiClient.post<{ message: string; voucher: VoucherItem }>(
      "/vouchers",
      payload
    );
    return res.data;
  },

  updateVoucher: async (id: string, payload: VoucherPayload) => {
    const res = await apiClient.put<{ message: string; voucher: VoucherItem }>(
      `/vouchers/${id}`,
      payload
    );
    return res.data;
  },

  toggleVoucherStatus: async (id: string) => {
    const res = await apiClient.patch<{ message: string; voucher: VoucherItem }>(
      `/vouchers/${id}/toggle-status`
    );
    return res.data;
  },

  deleteVoucher: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/vouchers/${id}`);
    return res.data;
  },

  checkVoucher: async (data: { code: string; orderTotal: number }) => {
    const res = await apiClient.post<{
      message: string;
      voucher: {
        code: string;
        title: string;
        discountType: "fixed" | "percentage";
        discountValue: number;
      };
      discountAmount: number;
      finalTotal: number;
    }>("/vouchers/check", data);
    return res.data;
  },
};
