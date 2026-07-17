import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { getOnboardingClient } from '../lib/onboardingClients.js';
import { buildOnboardingSystemPrompt, ONBOARDING_COMPLETE_MARKER } from '../lib/onboardingPrompt.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CLAUDE_MODEL = 'claude-haiku-4-5';

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' });
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

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      temperature: 0.7,
      system: buildOnboardingSystemPrompt(client),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : undefined;

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
