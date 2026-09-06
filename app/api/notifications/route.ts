import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { checkDueDoseReminders } from "@/lib/notifications";
import type { INotification, IResponse } from "@/interfaces/interfaces";

// GET /api/notifications — the notifications page's data source, and also
// what the navbar badge's unread count is derived from (same list, same
// query — see hooks/useNotifications.ts). Runs the lazy dose-reminder check
// first (see lib/notifications.ts's comment on why this is on-read rather
// than cron-driven) so reminders show up without any background job.
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  await checkDueDoseReminders(sessionUser.id);

  const rows = await prisma.notification.findMany({
    where: { userId: sessionUser.id },
    orderBy: { createdAt: "desc" },
  });

  const data: INotification[] = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    medicationId: n.medicationId,
    doseId: n.doseId,
    pharmacyId: n.pharmacyId,
    createdAt: n.createdAt.toISOString(),
  }));

  return NextResponse.json({ status: 200, data } satisfies IResponse<INotification[]>, { status: 200 });
}

// PATCH /api/notifications — marks every one of the current user's
// notifications read. A body-less "mark all" rather than a per-id route,
// matching the notifications page's one "Mark all read" action.
export async function PATCH() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  await prisma.notification.updateMany({
    where: { userId: sessionUser.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
