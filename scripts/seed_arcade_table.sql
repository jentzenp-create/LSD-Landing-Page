-- Leads captured by the Bottleneck Busters arcade game (/arcade)
-- Run this once in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS arcade_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    email text NOT NULL,
    first_name text,
    business_name text,
    industry text,
    world_reached int NOT NULL DEFAULT 1,
    answers jsonb NOT NULL DEFAULT '{}'::jsonb,
    score int,
    stars int,
    stars_total int,
    play_seconds int,
    source text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS arcade_leads_email_idx ON arcade_leads (email);
CREATE INDEX IF NOT EXISTS arcade_leads_created_at_idx ON arcade_leads (created_at DESC);

ALTER TABLE arcade_leads ENABLE ROW LEVEL SECURITY;

-- The game can only INSERT. There is deliberately no anon SELECT/UPDATE policy,
-- so nobody can read the lead list with the public anon key. View leads in the
-- Supabase dashboard (or via a server-side function using the service role key).
CREATE POLICY "Allow anon insert" ON arcade_leads
    FOR INSERT TO anon WITH CHECK (true);
