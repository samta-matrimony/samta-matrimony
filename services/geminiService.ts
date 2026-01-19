// src/services/geminiService.ts
// SAFE CLIENT WRAPPER — DOES NOT CALL GEMINI DIRECTLY

export type GeminiPayload = {
  prompt: string;
  context?: string;
};

const API_URL = "/api/gemini-proxy";

/**
 * Low-level call (used internally)
 */
async function callGemini(payload: GeminiPayload): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Gemini request failed");
  }

  const data = await res.json();
  return data.text ?? "";
}

/**
 * Public helpers (USED BY YOUR PAGES)
 */

export async function generateSmartBio(input: string) {
  return callGemini({
    prompt: `Create a professional matrimony bio:\n${input}`,
  });
}

export async function getAIBasedRecommendations(profile: any) {
  return callGemini({
    prompt: `Suggest suitable matches for this profile:\n${JSON.stringify(profile)}`,
  });
}

export async function getMatchmakingInsights(profile: any) {
  return callGemini({
    prompt: `Provide matchmaking insights:\n${JSON.stringify(profile)}`,
  });
}

/**
 * Availability check (safe)
 */
export function isGeminiAvailable() {
  return true;
}