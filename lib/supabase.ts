
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Studio functionality will be limited.');
}

// createClient throws if URL is empty, so guard when credentials are absent (e.g. local dev without .env).
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({ from: () => ({ upsert: async () => {}, select: async () => ({ data: [], error: null }) }) } as any);
