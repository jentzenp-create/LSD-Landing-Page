
import React, { useState, useEffect, useRef } from 'react';

/* ── Config ────────────────────────────────────────────────────────────── */

interface Task {
  id: string;
  label: string;
  hours: number;
}

const INITIAL_TASKS: Task[] = [
  { id: 'followup', label: 'Lead follow-up & nurturing', hours: 0 },
  { id: 'scheduling', label: 'Scheduling & calendar management', hours: 0 },
  { id: 'content', label: 'Content creation & repurposing', hours: 0 },
  { id: 'onboarding', label: 'Client onboarding & check-ins', hours: 0 },
  { id: 'admin', label: 'Admin, invoicing & reporting', hours: 0 },
];

const AGENT_RECOVERY = 0.75; // conservative 75% automation rate

const fmt = (n: number) => Math.round(n).toLocaleString();

/* ── Fun lifestyle perks you get back ──────────────────────────────────── */

interface Perk {
  /** minimum recovered hours/week to show this perk */
  minHours: number;
  label: string;
  detail: (hrs: number) => string;
  icon: React.ReactNode;
  /** Video file in /public/perks/ — plays on hover. e.g. "touch-grass.mp4" */
  video?: string;
}

/* ── Hover video tooltip ───────────────────────────────────────────────── */

const VideoTooltip: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none animate-[tooltipIn_0.2s_ease]">
      <div className="w-56 h-[126px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-primary/30 bg-black">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary/30" />
    </div>
  );
};

const PERKS: Perk[] = [
  {
    minHours: 1,
    label: 'Touch grass',
    detail: (h) => `${fmt(h * 60)} min/week of actual sunshine`,
    video: '/perks/touch-grass.mp4',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 10V22M4 10c0-1 .6-3.5 4-4.5C8 3.5 10 2 12 2s4 1.5 4 3.5c3.4 1 4 3.5 4 4.5M9 22h6M7 15l5-5 5 5" />
      </svg>
    ),
  },
  {
    minHours: 2,
    label: 'Play with your dog',
    detail: (h) => `${fmt(h * 4.33)} extra fetch sessions/month`,
    video: '/perks/play-with-dog.mp4',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75z" />
        <path d="M4.42 11.247A13.152 13.152 0 004 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 00-.493-3.309" />
      </svg>
    ),
  },
  {
    minHours: 3,
    label: 'Read actual books',
    video: '/perks/read-books.mp4',
    detail: (h) => `~${fmt((h * 4.33) / 5)} books/month at your pace`,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    minHours: 4,
    label: 'Actually cook dinner',
    video: '/perks/cook-dinner.mp4',
    detail: (h) => `${fmt(h)} home-cooked meals/week instead of DoorDash`,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    minHours: 5,
    label: 'Go to the gym',
    video: '/perks/go-to-gym.mp4',
    detail: (h) => `${fmt(h * 4.33)} workouts/month you "didn't have time for"`,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5" />
        <path d="M2 12h4M18 12h4M12 2v4M12 18v4" />
      </svg>
    ),
  },
  {
    minHours: 7,
    label: 'Take Fridays off',
    video: '/perks/fridays-off.mp4',
    detail: () => `52 extra free days/year. That's 7.4 bonus weeks`,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
  {
    minHours: 10,
    label: 'Learn a new skill',
    video: '/perks/learn-skill.mp4',
    detail: () => `Guitar, painting, woodworking. You pick`,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    minHours: 15,
    label: 'Start that side project',
    video: '/perks/side-project.mp4',
    detail: (h) => `${fmt(h)} hrs/week on the thing you keep "meaning to get to"`,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      </svg>
    ),
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

/* ── Perk card with hover video ─────────────────────────────────────────── */

const PerkCard: React.FC<{ perk: Perk; recoveredHours: number }> = ({ perk, recoveredHours }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-start gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 transition-all hover:bg-white/[0.07] cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Video tooltip on hover */}
      {hovered && perk.video && <VideoTooltip src={perk.video} />}

      <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 text-primary mt-0.5">
        {perk.icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">
          {perk.label}
          {perk.video && (
            <span className="inline-block ml-1.5 w-1.5 h-1.5 bg-primary/50 rounded-full align-middle" title="Hover for preview" />
          )}
        </p>
        <p className="text-xs text-white/40 font-medium leading-relaxed">
          {perk.detail(recoveredHours)}
        </p>
      </div>
    </div>
  );
};

const ROICalculator: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [hourlyRate, setHourlyRate] = useState(100);
  const [revealed, setRevealed] = useState(false);

  const totalHours = tasks.reduce((s, t) => s + t.hours, 0);
  const monthlyHours = totalHours * 4.33;
  const monthlyCost = monthlyHours * hourlyRate;
  const recoverable = monthlyCost * AGENT_RECOVERY;
  const annualRecoverable = recoverable * 12;
  const recoveredHoursWeek = totalHours * AGENT_RECOVERY;

  const updateHours = (id: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, hours: Math.max(0, Math.min(40, t.hours + delta)) } : t
      )
    );
  };

  useEffect(() => {
    if (totalHours > 0) setRevealed(true);
  }, [totalHours]);

  const getVerdict = () => {
    if (recoverable < 500)
      return { label: 'Early stage', msg: 'Even small automations compound fast. Start with follow-up.' };
    if (recoverable < 2000)
      return { label: 'Real opportunity', msg: 'You have clear wins on the table. An agent pays for itself in weeks.' };
    return { label: 'Significant leak', msg: "You're losing serious money to manual work. Agents aren't optional at this stage." };
  };

  const verdict = getVerdict();

  // Filter perks based on recovered hours
  const activePerks = PERKS.filter((p) => recoveredHoursWeek >= p.minHours);

  return (
    <div>
      {/* Hourly rate slider */}
      <div className="mb-10">
        <label className="text-[11px] tracking-[2px] text-white/30 font-semibold block mb-3 uppercase">
          Your Hourly Value
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={25}
            max={500}
            step={25}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
          />
          <div className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2 min-w-[80px] text-center">
            <span className="text-lg font-bold text-primary">${hourlyRate}</span>
            <span className="text-[10px] text-white/30 block font-semibold">per hour</span>
          </div>
        </div>
      </div>

      {/* Task rows */}
      <div className="mb-10">
        <div className="grid grid-cols-[1fr_120px] gap-2 mb-2 px-1">
          <span className="text-[11px] tracking-[2px] text-white/20 font-semibold uppercase">Task</span>
          <span className="text-[11px] tracking-[2px] text-white/20 font-semibold uppercase text-center">Hrs / Week</span>
        </div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`grid grid-cols-[1fr_120px] gap-2 items-center px-4 py-3.5 rounded-xl mb-1.5 border transition-all ${
              task.hours > 0
                ? 'bg-white/[0.06] border-white/10'
                : 'bg-transparent border-white/[0.04]'
            }`}
          >
            <span className={`text-sm font-medium ${task.hours > 0 ? 'text-white' : 'text-white/40'}`}>
              {task.label}
            </span>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => updateHours(task.id, -1)}
                className="w-7 h-7 bg-white/[0.06] border border-white/10 rounded-lg text-white/50
                  hover:bg-white/10 hover:text-white transition-all flex items-center justify-center text-base leading-none"
              >
                -
              </button>
              <span className={`min-w-[24px] text-center text-base font-bold ${task.hours > 0 ? 'text-primary' : 'text-white/20'}`}>
                {task.hours}
              </span>
              <button
                onClick={() => updateHours(task.id, 1)}
                className="w-7 h-7 bg-white/[0.06] border border-white/10 rounded-lg text-white/50
                  hover:bg-white/10 hover:text-white transition-all flex items-center justify-center text-base leading-none"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {revealed && totalHours > 0 ? (
        <div className="animate-[fadeIn_0.4s_ease]">
          <div className="border-t border-white/10 pt-8 mb-6">
            <div className="text-[11px] tracking-[3px] text-white/25 font-semibold mb-6 uppercase">Your Results</div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Hours/month on manual work', value: `${fmt(monthlyHours)} hrs`, highlight: false },
                { label: 'Monthly cost of that time', value: `$${fmt(monthlyCost)}`, highlight: false },
                { label: 'Agents could recover', value: `$${fmt(recoverable)}/mo`, highlight: true },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl p-4 text-center border ${
                    card.highlight
                      ? 'bg-primary/[0.08] border-primary/20'
                      : 'bg-white/[0.04] border-white/[0.06]'
                  }`}
                >
                  <div className={`text-xl font-extrabold mb-1 ${card.highlight ? 'text-primary' : 'text-white'}`}>
                    {card.value}
                  </div>
                  <div className="text-[10px] text-white/30 leading-snug font-medium">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Annual callout */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex justify-between items-center mb-6">
              <div>
                <div className="text-sm text-white/40 mb-1 font-medium">Annual opportunity</div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                  ${fmt(annualRecoverable)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] tracking-[2px] text-primary font-semibold mb-1 uppercase">
                  {verdict.label}
                </div>
                <div className="text-xs text-white/40 max-w-[200px] leading-relaxed">
                  {verdict.msg}
                </div>
              </div>
            </div>
          </div>

          {/* Fun perks section */}
          {activePerks.length > 0 && (
            <div className="mb-8">
              <div className="text-[11px] tracking-[3px] text-white/25 font-semibold mb-4 uppercase">
                What you could do with {fmt(recoveredHoursWeek)} extra hours/week
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePerks.map((perk) => (
                  <PerkCard key={perk.label} perk={perk} recoveredHours={recoveredHoursWeek} />
                ))}
              </div>
            </div>
          )}

          {/* Methodology note */}
          <p className="text-center text-[11px] text-white/20 font-medium mt-6">
            Based on 75% task automation. A conservative estimate for well-implemented AI agents.
          </p>
        </div>
      ) : (
        <div className="text-center py-10 text-white/20 text-sm font-medium">
          Add hours above to see your results
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tooltipIn { from { opacity: 0; transform: translate(-50%, 4px) scale(0.95); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
      `}</style>
    </div>
  );
};

export default ROICalculator;
