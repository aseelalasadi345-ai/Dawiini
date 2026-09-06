import { INotification, IResponse } from "@/interfaces/interfaces";
import { axiosGet, axiosPatch } from "@/lib/axios";

// GET /api/notifications
export function listNotifications(): Promise<IResponse<INotification[]>> {
  return axiosGet<INotification[]>("notifications");
}

// PATCH /api/notifications — marks all read.
export function markAllNotificationsRead(): Promise<IResponse<never>> {
  return axiosPatch<undefined, never>("notifications");
}

// PATCH /api/notifications/[id] — marks one read.
export function markNotificationRead(id: string): Promise<IResponse<never>> {
  return axiosPatch<undefined, never>(`notifications/${id}`);
}
