import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface OnboardingSessionRow {
  id: string;
  client_slug: string;
  business_name: string;
  contact_name: string;
  transcript: { role: string; content: string }[];
  summary: Record<string, unknown> | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const OnboardingAdmin: React.FC = () => {
  const [sessions, setSessions] = useState<OnboardingSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from('onboarding_sessions')
          .select('*')
          .order('updated_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setSessions((data ?? []) as OnboardingSessionRow[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error loading sessions.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-offWhite py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-1">Onboarding Sessions</h1>
        <p className="text-charcoal/60 mb-8 text-sm">
          Responses from client AI onboarding interviews. This page has no login — keep its URL private.
        </p>

        {loading && <p className="text-charcoal/60">Loading...</p>}
        {error && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm">
            Couldn't load sessions: {error}
          </p>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-charcoal/60">No onboarding sessions yet.</p>
        )}

        <div className="space-y-3">
          {sessions.map((session) => {
            const isOpen = expandedId === session.id;
            return (
              <div key={session.id} className="bg-white rounded-3xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : session.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div>
                    <p className="font-bold text-black">{session.business_name}</p>
                    <p className="text-sm text-charcoal/50">
                      {session.contact_name} · {new Date(session.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      session.completed ? 'bg-primary/10 text-charcoal' : 'bg-warm-gray text-charcoal/60'
                    }`}
                  >
                    {session.completed ? 'Completed' : 'In progress'}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-black/5 px-6 py-5 space-y-6">
                    {session.summary && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Summary</p>
                        <div className="space-y-3">
                          {Object.entries(session.summary).map(([key, value]) => {
                            if (!value || (Array.isArray(value) && value.length === 0)) return null;
                            return (
                              <div key={key}>
                                <p className="text-xs font-semibold text-charcoal/50">{key}</p>
                                <p className="text-black text-sm">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Full Transcript</p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {session.transcript.map((m, i) => (
                          <p key={i} className="text-sm">
                            <span className="font-bold text-black">{m.role === 'user' ? 'Client: ' : 'AI: '}</span>
                            <span className="text-charcoal/70">{m.content}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingAdmin;
