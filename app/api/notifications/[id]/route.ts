import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type { IResponse } from "@/interfaces/interfaces";

// PATCH /api/notifications/[id] — marks one notification read. No body:
// the notifications page only ever marks read on click, never back to
// unread, matching its pre-existing UI behavior.
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const { id } = await params;

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== sessionUser.id) {
    return NextResponse.json({ status: 404, message: "Not found" } satisfies IResponse<never>, { status: 200 });
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
