import { useTranslations } from "next-intl";

type Notification = {
  icon: string;
  titleKey: string;
  bodyKey: string;
  time: string;
  unread: boolean;
};

const notifications: Notification[] = [
  {
    icon: "⏰",
    titleKey: "doseReminder",
    bodyKey: "doseReminderBody",
    time: "10m",
    unread: true,
  },
  // ...
];

export default function NotificationsPage() {
  const t = useTranslations("notifications");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#0F1B34]">{t("title")}</h1>
        <button className="text-xs text-[#2563EB] font-medium hover:underline">
          {t("markAllRead")}
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border ${n.unread ? "border-blue-200 bg-blue-50/30" : "border-[#E5E9F0]"}`}
          >
            {/* icon + t(n.titleKey) + t(n.bodyKey) */}
          </div>
        ))}
      </div>
    </div>
  );
}