import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type { IResponse } from "@/interfaces/interfaces";

// DELETE /api/saved-medications/[catalogEntryId] — idempotent: unsaving
// something that isn't saved (or was already removed) is still a success.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ catalogEntryId: string }> },
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const { catalogEntryId } = await params;

  await prisma.savedMedication.deleteMany({
    where: { userId: sessionUser.id, catalogEntryId },
  });

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
