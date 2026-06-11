
import React, { useEffect, useState, useRef, useCallback } from 'react';

const COUNTER_WORKSPACE = 'lsd-ai-event-2026';
const STORAGE_KEY = 'lsd-ai-poll-vote';
const POLL_INTERVAL = 3000;

type StageKey = 'curious' | 'experimenting' | 'implementing' | 'systematized';
const STAGE_KEYS: StageKey[] = ['curious', 'experimenting', 'implementing', 'systematized'];

// Stage colors — progresses from cool to warm along the gradient journey
const STAGE_COLORS: Record<StageKey, { fill: string; iconBg: string; border: string; selectedBorder: string; selectedBg: string }> = {
  curious:       { fill: 'bg-sky-400',    iconBg: 'bg-sky-400/20',    border: 'border-sky-400/20',    selectedBorder: 'border-sky-400',    selectedBg: 'bg-sky-400/15' },
  experimenting: { fill: 'bg-teal-400',   iconBg: 'bg-teal-400/20',   border: 'border-teal-400/20',   selectedBorder: 'border-teal-400',   selectedBg: 'bg-teal-400/15' },
  implementing:  { fill: 'bg-amber-400',  iconBg: 'bg-amber-400/20',  border: 'border-amber-400/20',  selectedBorder: 'border-amber-400',  selectedBg: 'bg-amber-400/15' },
  systematized:  { fill: 'bg-primary',    iconBg: 'bg-primary/20',    border: 'border-primary/20',    selectedBorder: 'border-primary',    selectedBg: 'bg-primary/15' },
};

const STAGES: { key: StageKey; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'curious',
    label: 'Curious',
    description: "Heard about AI, haven't really tried it",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3a6 6 0 00-3.6 10.8c.5.4.6 1 .6 1.6v.1h6v-.1c0-.6.1-1.2.6-1.6A6 6 0 0012 3z" />
      </svg>
    ),
  },
  {
    key: 'experimenting',
    label: 'Experimenting',
    description: 'Played with ChatGPT or a few tools',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M10 3v5.2a2 2 0 01-.4 1.2L5.5 15.5A2 2 0 007 19h10a2 2 0 001.5-3.3l-4.1-6.1a2 2 0 01-.4-1.2V3" />
      </svg>
    ),
  },
  {
    key: 'implementing',
    label: 'Implementing',
    description: 'Actively using AI in my workflow',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9c.36.13.74.2 1.13.2H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    key: 'systematized',
    label: 'Systematized',
    description: 'AI is built into how my business runs',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
];

// Stage-specific funny reactions — a random one is shown after each vote
const VOTE_REACTIONS: Record<StageKey, string[]> = {
  curious: [
    "Welcome to the rabbit hole.",
    "Curiosity is a superpower. The robots approve.",
    "First step: curiosity. Next step: world domination.",
    "You're not behind, you're fashionably early.",
    "AI was curious about you, too.",
    "The journey of a thousand automations starts with one click.",
  ],
  experimenting: [
    "Ah, so you've met ChatGPT. It talks about you, too.",
    "Mad scientist energy. We respect it.",
    "Experimenting is just 'breaking things' with a better label.",
    "You've played with the tools. Now the tools play back.",
    "One prompt away from an existential crisis. In a good way.",
    "Lab coat not required, but encouraged.",
  ],
  implementing: [
    "Look at you, actually using the thing. Legend.",
    "Your competitors are still Googling 'what is AI.'",
    "Implementation mode: activated.",
    "You skipped the hype and went straight to the action. Respect.",
    "Your workflow just sent a thank-you note.",
    "While others debate, you deploy. Nice.",
  ],
  systematized: [
    "You didn't just adopt AI. You gave it a corner office.",
    "Tell us your secrets. Actually, your AI probably already did.",
    "The machines work FOR you. As it should be.",
    "You're the person everyone at this booth wants to be.",
    "Fully systematized? At this point AI is writing YOUR performance review.",
    "You're not at the booth to learn. You're here to flex.",
  ],
};

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

type Counts = Record<StageKey, number>;

const FALLBACK_COUNTS: Counts = {
  curious: 14,
  experimenting: 22,
  implementing: 11,
  systematized: 4,
};

const PollWidget: React.FC = () => {
  const [counts, setCounts] = useState<Counts>(FALLBACK_COUNTS);
  const [voted, setVoted] = useState<StageKey | null>(null);
  const [justVoted, setJustVoted] = useState<StageKey | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionVisible, setReactionVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [liveBlip, setLiveBlip] = useState<StageKey | null>(null);
  const prevCountsRef = useRef<Counts>(FALLBACK_COUNTS);
  const reactionQueueRef = useRef<{ key: StageKey; delta: number }[]>([]);
  const processingQueueRef = useRef(false);

  const fetchCounts = useCallback(async (): Promise<Counts | null> => {
    try {
      const results = await Promise.all(
        STAGE_KEYS.map((key) =>
          fetch(`https://api.counterapi.dev/v1/${COUNTER_WORKSPACE}/${key}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      const next: Partial<Counts> = {};
      results.forEach((res, i) => {
        if (res && typeof res.count === 'number') {
          next[STAGE_KEYS[i]] = res.count;
        }
      });
      if (Object.keys(next).length > 0) {
        return { ...FALLBACK_COUNTS, ...next };
      }
    } catch {}
    return null;
  }, []);

  const processReactionQueue = useCallback(() => {
    if (processingQueueRef.current) return;
    const item = reactionQueueRef.current.shift();
    if (!item) return;

    processingQueueRef.current = true;
    setLiveBlip(item.key);
    const comment = pickRandom(VOTE_REACTIONS[item.key]);
    setReaction(comment);
    setReactionVisible(true);

    setTimeout(() => setLiveBlip(null), 1000);
    setTimeout(() => {
      setReactionVisible(false);
      processingQueueRef.current = false;
      setTimeout(() => processReactionQueue(), 300);
    }, 2500);
  }, []);

  // Dev helper: press Shift+R while on the poll to reset your vote and test again
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'R') {
        localStorage.removeItem(STORAGE_KEY);
        setVoted(null);
        setJustVoted(null);
        setReaction(null);
        setReactionVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const prevVote = localStorage.getItem(STORAGE_KEY) as StageKey | null;
    if (prevVote) setVoted(prevVote);

    const init = async () => {
      const fresh = await fetchCounts();
      if (fresh) {
        setCounts(fresh);
        prevCountsRef.current = fresh;
      }
      setLoaded(true);
    };
    init();
  }, [fetchCounts]);

  // Live polling — pick up other people's votes every 3s
  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await fetchCounts();
      if (!fresh) return;

      const prev = prevCountsRef.current;
      const changed: { key: StageKey; delta: number }[] = [];
      for (const key of STAGE_KEYS) {
        const delta = fresh[key] - prev[key];
        if (delta > 0) changed.push({ key, delta });
      }

      if (changed.length > 0) {
        setCounts(fresh);
        prevCountsRef.current = fresh;
        for (const c of changed) reactionQueueRef.current.push(c);
        processReactionQueue();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchCounts, processReactionQueue]);

  const handleVote = async (key: StageKey) => {
    if (voted) return;

    localStorage.setItem(STORAGE_KEY, key);
    setVoted(key);
    setJustVoted(key);
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    prevCountsRef.current = { ...prevCountsRef.current, [key]: prevCountsRef.current[key] + 1 };
    setTimeout(() => setJustVoted(null), 1000);

    const comment = pickRandom(VOTE_REACTIONS[key]);
    setReaction(comment);
    setReactionVisible(true);
    setTimeout(() => setReactionVisible(false), 4000);

    try {
      const res = await fetch(`https://api.counterapi.dev/v1/${COUNTER_WORKSPACE}/${key}/up`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setCounts((prev) => ({ ...prev, [key]: data.count }));
          prevCountsRef.current[key] = data.count;
        }
      }
    } catch {}
  };

  const totalVotes = Object.values<number>(counts).reduce((a, b) => a + b, 0);
  const total = totalVotes || 1;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {STAGES.map((stage) => {
          const count = counts[stage.key];
          const pct = Math.round((count / total) * 100);
          const isSelected = voted === stage.key;
          const colors = STAGE_COLORS[stage.key];

          return (
            <button
              key={stage.key}
              onClick={() => handleVote(stage.key)}
              disabled={!!voted}
              className={`relative flex flex-col items-center text-center rounded-3xl border-2 p-5 md:p-6 transition-all backdrop-blur-sm ${
                isSelected
                  ? `${colors.selectedBorder} ${colors.selectedBg} shadow-lg shadow-black/30`
                  : `${colors.border} bg-white/[0.07] hover:bg-white/[0.12] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20`
              } ${voted && !isSelected ? 'opacity-50' : ''} ${voted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Floating +1 badge — own vote or live incoming */}
              {(justVoted === stage.key || liveBlip === stage.key) && (
                <span className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-white font-black text-lg animate-float-up">
                  +1
                </span>
              )}

              <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} text-white flex items-center justify-center mb-4`}>
                {stage.icon}
              </div>

              <h3 className="font-bold text-white text-base md:text-lg mb-1">{stage.label}</h3>
              <p className="text-xs md:text-sm text-white/50 font-medium mb-5 leading-snug">{stage.description}</p>

              {/* Cup / gauge */}
              <div className="relative w-full h-32 md:h-40 rounded-b-2xl rounded-t-md bg-white/[0.06] border border-white/10 overflow-hidden mt-auto">
                <div
                  className={`absolute bottom-0 left-0 right-0 ${colors.fill} rounded-b-2xl transition-[height] duration-700 ease-out ${
                    justVoted === stage.key || liveBlip === stage.key ? 'animate-pour' : ''
                  }`}
                  style={{ height: loaded ? `${Math.max(pct, 4)}%` : '0%' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-black text-white drop-shadow-sm">{pct}%</span>
                  <span className="text-[11px] md:text-xs font-bold text-white/40 uppercase tracking-wider">{count} votes</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Funny reaction toast */}
      {reaction && (
        <div
          className={`mx-auto mt-8 max-w-md text-center transition-all duration-500 ${
            reactionVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/10 px-6 py-3.5 rounded-2xl shadow-xl">
            <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p className="text-sm font-semibold leading-snug">{reaction}</p>
          </div>
        </div>
      )}

      <p className={`text-center text-white/30 text-sm font-bold uppercase tracking-widest ${reaction ? 'mt-4' : 'mt-8'}`}>
        {totalVotes > 0 ? `${totalVotes} responses so far` : 'Be the first to vote'}
        {voted && ' · Thanks for voting!'}
      </p>
    </div>
  );
};

export default PollWidget;
