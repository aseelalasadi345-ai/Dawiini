import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { extractPrescriptionData } from "@/lib/gemini";
import { scanExtractionSchema } from "@/lib/schemas/scan";
import type { ScannedMedication, ScanResult } from "@/lib/scan";

// Multipart body (an uploaded file), not JSON — can't go through the
// axiosPost/IResponse convention (see lib/axios.ts), so like
// app/api/admin/pharmacies/route.ts this returns real HTTP status codes
// with a plain { error } body on failure, matched by a raw fetch() on the
// client rather than the shared axios wrapper.

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const TIMEOUT_MS = 25_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("TIMEOUT")),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image was uploaded" }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a JPG, PNG, or PDF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That file is too large (max 8MB). Please use a smaller image." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  let raw: unknown;
  try {
    raw = await withTimeout(extractPrescriptionData(base64, file.type), TIMEOUT_MS);
  } catch (err) {
    if (err instanceof Error && err.message === "TIMEOUT") {
      return NextResponse.json(
        { error: "The scan took too long. Please try again." },
        { status: 504 },
      );
    }
    console.error("Gemini extraction failed:", err);
    return NextResponse.json(
      { error: "Couldn't reach the AI scanner. Please try again." },
      { status: 502 },
    );
  }

  const parsed = scanExtractionSchema.safeParse(raw);
  if (!parsed.success) {
    // The model returned something, but not the shape we asked for — treat
    // as a scanner failure rather than trusting a malformed/hallucinated
    // response, and log for debugging without ever exposing it to the client.
    console.error("Gemini returned an unexpected shape:", parsed.error, raw);
    return NextResponse.json(
      { error: "Couldn't read that prescription. Please try again." },
      { status: 502 },
    );
  }

  const medications: ScannedMedication[] = parsed.data.medications.map((m) => ({
    id: crypto.randomUUID(),
    name: m.name ?? "",
    strength: m.strength ?? "",
    frequency: m.frequency ?? "",
    quantity: m.quantity ?? "",
  }));

  const outcome: ScanResult["outcome"] =
    medications.length === 0
      ? "failure"
      : medications.every((m) => m.name && m.strength && m.frequency && m.quantity)
        ? "success"
        : "partial";

  const result: ScanResult = { outcome, medications };
  return NextResponse.json({ data: result }, { status: 200 });
}
