import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOnboardingClient } from '../lib/onboardingClients';
import { buildOnboardingSystemPrompt, ONBOARDING_COMPLETE_MARKER } from '../lib/onboardingPrompt';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';

function extractCompletion(text: string): { reply: string; done: boolean; summary?: Record<string, unknown> } {
  const markerIndex = text.indexOf(ONBOARDING_COMPLETE_MARKER);
  if (markerIndex === -1) {
    return { reply: text.trim(), done: false };
  }

  const before = text.slice(0, markerIndex).trim();
  const after = text.slice(markerIndex + ONBOARDING_COMPLETE_MARKER.length);
  const jsonMatch = after.match(/```json\s*([\s\S]*?)```/i) || after.match(/\{[\s\S]*\}/);

  let summary: Record<string, unknown> | undefined;
  if (jsonMatch) {
    try {
      summary = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
    } catch {
      summary = undefined;
    }
  }

  return { reply: before, done: true, summary };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
    return;
  }

  const { clientSlug, messages } = (req.body ?? {}) as { clientSlug?: string; messages?: ChatMessage[] };

  const client = getOnboardingClient(clientSlug);
  if (!client) {
    res.status(404).json({ error: `Unknown onboarding client "${clientSlug}".` });
    return;
  }

  if (!Array.isArray(messages)) {
    res.status(400).json({ error: 'messages must be an array.' });
    return;
  }

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: buildOnboardingSystemPrompt(client) }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      res.status(502).json({ error: 'The AI service returned an error. Please try again.' });
      return;
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      res.status(502).json({ error: 'The AI service returned an empty response.' });
      return;
    }

    const result = extractCompletion(text);
    res.status(200).json(result);
  } catch (err) {
    console.error('onboarding-chat handler error:', err);
    res.status(500).json({ error: 'Something went wrong talking to the AI. Please try again.' });
  }
}
