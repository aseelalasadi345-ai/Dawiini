import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";

// Shared by both the notifications page and the navbar badge — the badge's
// unread count is derived from this same query's data (see
// components/Navbar.tsx), not a separate endpoint, matching how the badge
// count was already derived from the same array as the page before this
// was wired to real data.
export function useNotifications(enabled: boolean = true) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    enabled,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
