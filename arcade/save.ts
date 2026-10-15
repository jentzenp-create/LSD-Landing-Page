// Saves a lead + their in-game answers to Supabase (table: arcade_leads, see
// scripts/seed_arcade_table.sql). supabase-js is loaded only when someone submits,
// so it doesn't slow down the game's first load.
import { SOURCE } from './config';
import { WORLD1_QUESTIONS } from './questions';
import { run } from './state';

export interface LeadInput {
  firstName: string;
  email: string;
  businessName: string;
}

export async function saveLead(input: LeadInput): Promise<{ ok: boolean; error?: string }> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const answers = Object.fromEntries(
    WORLD1_QUESTIONS.filter((q) => q.id in run.answers).map((q) => {
      const a = q.answers[run.answers[q.id]];
      return [q.id, { answer: a.label, severity: a.severity }];
    }),
  );

  const row = {
    session_id: run.sessionId,
    email: input.email.trim().toLowerCase(),
    first_name: input.firstName.trim() || null,
    business_name: input.businessName.trim() || null,
    industry: run.industry,
    world_reached: 1,
    answers,
    score: run.score,
    stars: run.stars,
    stars_total: run.starsTotal,
    play_seconds: run.finishedAt && run.startedAt ? Math.round((run.finishedAt - run.startedAt) / 1000) : null,
    source: SOURCE,
  };

  if (!url || !key) {
    console.warn('[arcade] Supabase env vars missing; lead not saved.', row);
    return { ok: true };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from('arcade_leads').insert(row);
    if (error) {
      console.error('[arcade] save failed', error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error('[arcade] save failed', e);
    return { ok: false, error: 'Network error' };
  }
}
