export type NotificationCategory =
  | "doseReminder"
  | "backInStock"
  | "doseTaken"
  | "refillNeeded"
  | "availabilityUpdate";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  unread: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n1", category: "doseReminder", unread: true },
  { id: "n2", category: "backInStock", unread: true },
  { id: "n3", category: "doseTaken", unread: false },
  { id: "n4", category: "refillNeeded", unread: false },
  { id: "n5", category: "availabilityUpdate", unread: false },
];
