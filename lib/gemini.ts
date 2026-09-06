import { GoogleGenAI } from "@google/genai";

// Model used for prescription-image extraction (app/api/search/scan/route.ts).
// Configurable via env in case a future model needs swapping in without a
// code change; falls back to a current, vision-capable, low-latency model.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

// Lazy singleton — constructing GoogleGenAI eagerly at module load would
// throw (or silently run unauthenticated) the moment anything imports this
// file, including at build time before GEMINI_API_KEY is ever configured.
// Only fail when a route actually tries to use it.
export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const EXTRACTION_PROMPT = `You are extracting medication information from a photo or scan of a prescription. Only extract information that is clearly legible and explicitly written in the image — never guess, infer, or invent a value that isn't actually visible.

Return ONLY a JSON object of exactly this shape, with no extra commentary or markdown fences:
{
  "medications": [
    {
      "name": string or null,       // the medication's name, exactly as written
      "strength": string or null,   // dosage strength, e.g. "500mg", "10 IU" — only if explicitly written
      "frequency": string or null,  // how often/when to take it, in the prescription's own words, e.g. "twice daily", "before meals"
      "quantity": string or null    // amount prescribed/dispensed, e.g. "30 tablets" — only if written
    }
  ]
}

Rules:
- If a field is not clearly legible or not present for a given medication, set it to null. Never leave it out, never guess, never substitute an empty string for null.
- Include one object per medication, in the order they appear, if the image lists more than one.
- If the image is not a prescription, is blank, or has no legible medication information at all, return {"medications": []}.
- Never invent a medication that isn't actually written in the image.`;

// Sends one prescription image to Gemini and returns whatever it parses out
// of the model's response as plain `unknown` — this function does not
// validate the shape. The caller (the API route) is responsible for
// zod-validating the result before trusting it; the model's JSON is never
// assumed correct just because it parsed.
export async function extractPrescriptionData(
  imageBase64: string,
  mimeType: string,
): Promise<unknown> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: EXTRACTION_PROMPT },
          { inlineData: { mimeType, data: imageBase64 } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text);
}
