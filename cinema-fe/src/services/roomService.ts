import apiClient from "./apiClient";

export interface Room {
  _id: string;
  name: string;
  roomType: "2D" | "3D" | "IMAX" | "4DX" | "VIP";
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
  status: "active" | "inactive" | "maintenance";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomPayload {
  name: string;
  roomType?: "2D" | "3D" | "IMAX" | "4DX" | "VIP";
  totalSeats?: number;
  rows?: number;
  seatsPerRow?: number;
  description?: string;
}

export const roomService = {
  getRooms: async (params?: {
    status?: string;
    roomType?: string;
    activeOnly?: string;
  }) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      rooms: Room[];
    }>("/rooms", { params });
    return res.data;
  },

  getRoomById: async (id: string) => {
    const res = await apiClient.get<{ message: string; room: Room }>(
      `/rooms/${id}`
    );
    return res.data;
  },

  createRoom: async (payload: RoomPayload) => {
    const res = await apiClient.post<{ message: string; room: Room }>(
      "/rooms",
      payload
    );
    return res.data;
  },

  updateRoom: async (id: string, payload: RoomPayload) => {
    const res = await apiClient.put<{ message: string; room: Room }>(
      `/rooms/${id}`,
      payload
    );
    return res.data;
  },

  updateRoomStatus: async (
    id: string,
    status: "active" | "inactive" | "maintenance"
  ) => {
    const res = await apiClient.patch<{ message: string; room: Room }>(
      `/rooms/${id}/status`,
      { status }
    );
    return res.data;
  },
};
