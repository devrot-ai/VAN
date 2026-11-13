import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { getUserById, listFields } from "@/lib/db";
import { unauthorized, badRequest } from "@/lib/api";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are VAN Assistant, an agricultural expert integrated into the VAN farm management platform. You help farmers, equipment providers, cooperatives, and buyers with practical farming advice.

Your expertise includes:
- Crop management: planting schedules, soil health, irrigation, pest control, yield optimization
- Equipment: maintenance schedules, selection advice, operational best practices
- Farm finance: budgeting, cost tracking, revenue planning, subsidy guidance
- Weather interpretation: how forecasts affect planting, spraying, and harvesting decisions
- Harvest planning: timing, storage, quality grading, market timing
- Cooperative management: resource sharing, member coordination
- Buyer-seller matching: produce quality standards, pricing trends

Keep answers practical, concise, and actionable. When the user's farm context is provided, tailor your advice to their specific crops, location, and field conditions. If you're unsure, acknowledge it and suggest consulting a local agricultural extension service.`;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return badRequest("Please enter a message.");
  }

  // Enrich with user's farm context
  const fullUser = getUserById(user.id);
  const fields = listFields(user.id);
  let context = "";
  if (fullUser) {
    context = `\n\nUser context: ${fullUser.name}, role: ${fullUser.role}`;
    if (fullUser.farm_name) context += `, farm: ${fullUser.farm_name}`;
    if (fullUser.location) context += `, location: ${fullUser.location}`;
  }
  if (fields.length > 0) {
    context += `\nFields: ${fields.map((f) => `${f.name} (${f.area_ha} ha, ${f.crop || "fallow"}, ${f.status || "unknown"})`).join(", ")}`;
  }

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT + context + `\n\nQuestion: ${message}` }] },
    ],
  });
  return Response.json({ reply: res.text });
}