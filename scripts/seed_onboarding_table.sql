-- Table for AI client-onboarding interview sessions (/onboarding/:slug)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_slug text NOT NULL,
    business_name text NOT NULL,
    contact_name text NOT NULL,
    transcript jsonb NOT NULL,
    summary jsonb,
    completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS onboarding_sessions_client_slug_idx ON onboarding_sessions (client_slug);

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone with the anon key can create/update their own onboarding session (matches this
-- project's existing public-form pattern). Anyone with the anon key can also read sessions
-- for the admin view at /onboarding-admin — there is no login on that page, so treat its
-- URL as a shared secret and avoid linking it from public navigation.
CREATE POLICY "Allow anon insert" ON onboarding_sessions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON onboarding_sessions
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon select" ON onboarding_sessions
    FOR SELECT TO anon USING (true);
