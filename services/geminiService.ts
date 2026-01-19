// src/services/geminiService.ts
// SAFE CLIENT WRAPPER — DOES NOT CALL GEMINI DIRECTLY

import { UserProfile } from '../types';

export type GeminiPayload = {
  prompt: string;
  context?: string;
};

const API_URL = '/api/gemini-proxy';

/**
 * Low-level call (used internally)
 */
async function callGemini(payload: GeminiPayload): Promise<string> {
  try {
    if (!payload.prompt || typeof payload.prompt !== 'string') {
      throw new Error('Invalid prompt provided to Gemini');
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Gemini request failed: ${error || res.statusText}`);
    }

    const data = await res.json();
    if (!data.text || typeof data.text !== 'string') {
      throw new Error('Invalid response from Gemini API');
    }

    return data.text;
  } catch (err) {
    console.error('Gemini API error:', err);
    throw err;
  }
}

/**
 * Public helpers (USED BY YOUR PAGES)
 */

export async function generateSmartBio(profile: Partial<UserProfile>): Promise<string> {
  try {
    if (!profile || typeof profile !== 'object') {
      throw new Error('Invalid profile data');
    }

    const profileText = JSON.stringify({
      name: profile.name || 'Not specified',
      occupation: profile.occupation || 'Not specified',
      education: profile.education || 'Not specified',
      interests: profile.lifestyle || [],
    });

    return await callGemini({
      prompt: `Create a professional matrimony bio for someone with this profile:\n${profileText}\n\nBe concise, warm, and authentic.`,
    });
  } catch (err) {
    console.error('Bio generation failed:', err);
    throw new Error('Failed to generate bio. Please try again.');
  }
}

export async function getAIBasedRecommendations(
  userProfile: UserProfile,
  candidates: UserProfile[]
): Promise<any[]> {
  try {
    if (!userProfile || typeof userProfile !== 'object') {
      throw new Error('Invalid user profile');
    }

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return [];
    }

    const profileSummary = JSON.stringify({
      preferences: userProfile.partnerPreferences,
      location: userProfile.city,
      religion: userProfile.religion,
      age: userProfile.age,
    });

    const candidatesSummary = candidates
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        occupation: c.occupation,
        location: c.city,
      }));

    const response = await callGemini({
      prompt: `Given this user profile:\n${profileSummary}\n\nRank these candidates by compatibility (1-10):\n${JSON.stringify(candidatesSummary)}\n\nReturn JSON array with id and score.`,
    });

    // Parse and validate response
    try {
      return JSON.parse(response).slice(0, 10);
    } catch {
      console.warn('Could not parse AI recommendations, returning unranked');
      return candidates.slice(0, 10).map((c) => ({ id: c.id, score: 5 }));
    }
  } catch (err) {
    console.error('Recommendation generation failed:', err);
    return [];
  }
}

export async function getMatchmakingInsights(
  userProfile: UserProfile,
  candidateProfile: UserProfile
): Promise<string> {
  try {
    if (!userProfile || !candidateProfile) {
      throw new Error('Missing profile data');
    }

    const userSummary = JSON.stringify({
      name: userProfile.name,
      age: userProfile.age,
      occupation: userProfile.occupation,
      preferences: userProfile.partnerPreferences,
    });

    const candidateSummary = JSON.stringify({
      name: candidateProfile.name,
      age: candidateProfile.age,
      occupation: candidateProfile.occupation,
      lifestyle: candidateProfile.lifestyle,
    });

    return await callGemini({
      prompt: `Provide compatibility insights between:\n\nUser:\n${userSummary}\n\nCandidate:\n${candidateSummary}\n\nBe encouraging and constructive.`,
    });
  } catch (err) {
    console.error('Matchmaking insights failed:', err);
    throw new Error('Failed to generate insights. Please try again.');
  }
}

/**
 * Availability check (safe)
 */
export function isGeminiAvailable(): boolean {
  return typeof fetch !== 'undefined';
}