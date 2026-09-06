"use client";

import {
  AlarmClock,
  AlertTriangle,
  CheckCircle2,
  Package,
  Pill,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/date";
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";
import type { INotification } from "@/interfaces/interfaces";

const ICON_STYLES: Record<
  INotification["type"],
  { Icon: typeof AlarmClock; bg: string; text: string }
> = {
  dose_reminder: { Icon: AlarmClock, bg: "bg-danger-light", text: "text-danger" },
  back_in_stock: { Icon: CheckCircle2, bg: "bg-success-light", text: "text-success" },
  dose_taken: { Icon: Pill, bg: "bg-danger-light", text: "text-danger" },
  refill_needed: { Icon: AlertTriangle, bg: "bg-warning-light", text: "text-warning" },
  availability_update: { Icon: Package, bg: "bg-warning-light", text: "text-warning-strong" },
};

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const { data: response, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const items = response?.data ?? [];
  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={!hasUnread || markAllRead.isPending}
          className="text-sm font-medium text-primary hover:underline disabled:text-muted disabled:no-underline disabled:cursor-default"
        >
          {t("markAllRead")}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted text-center py-10">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => {
            const { Icon, bg, text } = ICON_STYLES[n.type];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.read && markRead.mutate(n.id)}
                className={`w-full text-start flex items-start gap-3 p-4 rounded-xl border transition-all active:scale-[0.99] ${
                  !n.read
                    ? "border-hover-border bg-primary-light hover:bg-primary-light/70"
                    : "border-border bg-surface hover:bg-background"
                }`}
              >
                <span
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${bg} ${text}`}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </span>
                  <span className="block text-sm text-muted mt-0.5">
                    {n.message}
                  </span>
                  <span className="block text-xs text-muted mt-1.5">
                    {formatRelativeTime(new Date(n.createdAt))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
