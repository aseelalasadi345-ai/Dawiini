import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pharmacySchema, type PharmacyInput } from '@/lib/validations/admin';
import { getSessionUserWithRole } from '@/lib/auth/session';
import { DAY_NAMES, formatTime12h } from '@/lib/pharmacyHours';

// Builds the 7 PharmacyHours rows to create alongside the Pharmacy —
// server-computed, not client-supplied, so "24 hours every day" can't drift
// out of sync with what's actually in `hours` (see pharmacySchema's comment
// on why the client omits `hours` entirely in that case).
function buildHoursRows(
  is24Hours: boolean,
  hours: PharmacyInput['hours'],
): { days: string; hours: string }[] {
  if (is24Hours) {
    return DAY_NAMES.map((day) => ({ days: day, hours: 'Open 24 hours' }));
  }

  // Written in canonical Monday->Sunday order regardless of the order the
  // client sent them in — pharmacySchema already guarantees exactly one
  // entry per real day name exists. Each day resolves independently
  // (closed / 24h / a specific range) — this is what lets one day be a
  // 24-hour exception while the rest of the week has real hours, matching
  // real seeded data (e.g. "New Lebanon Pharmacy").
  return DAY_NAMES.map((day) => {
    const entry = hours!.find((h) => h.day === day)!;
    return {
      days: day,
      hours: entry.closed
        ? 'Closed'
        : entry.is24h
          ? 'Open 24 hours'
          : `${formatTime12h(entry.opensAt!)} – ${formatTime12h(entry.closesAt!)}`,
    };
  });
}

export async function POST(request: Request) {
  // 401 (no session) vs 403 (signed in, not an admin) — see
  // getSessionUserWithRole's comment for why role is a Prisma lookup rather
  // than a Supabase Auth claim.
  const { user, role } = await getSessionUserWithRole();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = pharmacySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { name, address, phone, is24Hours, hours, mapUrl, latitude, longitude } = parsed.data;

  const pharmacy = await prisma.pharmacy.create({
    data: {
      name,
      address,
      phone,
      is24Hours,
      mapUrl: mapUrl || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      hours: { create: buildHoursRows(is24Hours, hours) },
    },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      is24Hours: true,
      mapUrl: true,
      latitude: true,
      longitude: true,
      hours: { select: { days: true, hours: true } },
    },
  });

  return NextResponse.json({ pharmacy }, { status: 201 });
}
