import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type { IRecentSearch, IResponse } from "@/interfaces/interfaces";

const DEFAULT_LIMIT = 4;
const MAX_LIMIT = 10;

// GET /api/recent-searches?limit=<n> — the Home and Search pages' "Recent
// Searches" chips, ordered most-recently-searched first.
export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const limitParam = Number(req.nextUrl.searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const rows = await prisma.recentSearch.findMany({
    where: { userId: sessionUser.id },
    include: { catalogEntry: { select: { name: true, strength: true } } },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  const data: IRecentSearch[] = rows.map((r) => ({
    catalogEntryId: r.catalogEntryId,
    name: r.catalogEntry.name,
    strength: r.catalogEntry.strength,
  }));

  return NextResponse.json({ status: 200, data } satisfies IResponse<IRecentSearch[]>, { status: 200 });
}

// POST /api/recent-searches — body: { catalogEntryId }
// Recorded when a search result is actually selected (see
// app/[locale]/(home)/search/page.tsx's handleSelect), not on every
// keystroke. Upserts on [userId, catalogEntryId] — searching the same
// medication again just bumps its existing row's updatedAt back to the top
// rather than creating a duplicate entry.
export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const body = await req.json().catch(() => null);
  const catalogEntryId = typeof body?.catalogEntryId === "string" ? body.catalogEntryId : null;
  if (!catalogEntryId) {
    return NextResponse.json({ status: 400, message: "catalogEntryId is required" } satisfies IResponse<never>, { status: 200 });
  }

  const catalogEntry = await prisma.medicationCatalogEntry.findUnique({ where: { id: catalogEntryId } });
  if (!catalogEntry) {
    return NextResponse.json({ status: 404, message: "Medication not found" } satisfies IResponse<never>, { status: 200 });
  }

  // `update: {}` alone does NOT refresh `updatedAt` (confirmed empirically —
  // an empty update payload short-circuits before touching the row), so the
  // recency bump this route exists for silently wouldn't happen. Set it
  // explicitly instead of relying on @updatedAt's implicit-touch behavior.
  await prisma.recentSearch.upsert({
    where: { userId_catalogEntryId: { userId: sessionUser.id, catalogEntryId } },
    update: { updatedAt: new Date() },
    create: { userId: sessionUser.id, catalogEntryId },
  });

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
