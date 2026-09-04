import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pharmacySchema } from '@/lib/validations/admin';

export async function POST(request: Request) {
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

  const { name, address, phone, is24Hours, opensAt, openUntil, mapUrl } = parsed.data;

  const pharmacy = await prisma.pharmacy.create({
    data: {
      name,
      address,
      phone,
      is24Hours,
      opensAt: is24Hours ? null : opensAt || null,
      openUntil: is24Hours ? null : openUntil || null,
      mapUrl: mapUrl || null,
    },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      is24Hours: true,
      opensAt: true,
      openUntil: true,
      mapUrl: true,
    },
  });

  return NextResponse.json({ pharmacy }, { status: 201 });
}
