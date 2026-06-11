
import React from 'react';
import PollWidget from '../components/event/PollWidget';
import ROICalculator from '../components/event/ROICalculator';
import QuickForm from '../components/event/QuickForm';
import EventFooter from '../components/event/EventFooter';

/**
 * EVENT PAGE — TEMPORARY
 * This page replaces the normal /packages sales page for the in-person AI
 * event. The original sales page is preserved at
 * `pages/_archive/Packages.original.tsx` — copy its contents back into this
 * file to restore the normal page after the event.
 */

// ── $97 AI Audit — Stripe Payment Link ──────────────────────────────────────
// 1. In Stripe, create a one-time "Product" called "$97 AI Audit" ($97).
// 2. Create a Payment Link for it.
// 3. In that Payment Link's settings, set "After payment" → "Redirect
//    customers to a custom page" → paste your GoHighLevel calendar booking
//    URL for the AI Audit (e.g. https://api.leadconnectorhq.com/widget/booking/<calendar-id>).
//    That way: pay → land directly on your calendar to pick a time.
// 4. Paste the resulting Stripe Payment Link URL below.
const AUDIT_STRIPE_LINK = 'https://buy.stripe.com/dRm14n2cI4PAbH46ME0kE0y';

// Workshop registration — Luma event page
const WORKSHOP_LUMA_LINK = 'https://luma.com/w4fr7xzx';

const CalendarIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const SparkIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TargetIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const ChecklistIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l2 2 4-4" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const ArrowDownIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

const PackagesPage: React.FC = () => {
  return (
    <div className="event-page min-h-screen bg-white text-black selection:bg-primary selection:text-black">
      {/* Override the global content-visibility:auto on sections — it causes
           layout jumps on shorter event-page sections due to the 1000px intrinsic size */}
      <style>{`
        .event-page section {
          content-visibility: visible !important;
          contain-intrinsic-size: auto !important;
        }
      `}</style>

      {/* ── HEADER (no navigation — single locked page) ── */}
      <header className="py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center sm:justify-start">
          <img src="/logo.png" alt="Local Sun Digital" className="h-10 w-auto" />
        </div>
      </header>

      <main>

        {/* ── HERO ── */}
        <section className="relative pt-8 pb-16 md:pt-16 md:pb-28 overflow-hidden bg-white">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Copy */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.05] text-black">
                  What If AI Could Save You<br />
                  <span className="text-primary">10 Hours a Week?</span>
                </h1>
                <p className="text-lg md:text-xl text-charcoal/60 mb-10 leading-relaxed font-medium max-w-xl">
                  Most businesses are leaving hours on the table doing things AI
                  can handle in minutes. Find out exactly where, for free or for $97.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <a
                    href="#workshop"
                    className="bg-black text-white px-8 py-4 rounded-full font-bold text-base hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95 text-center"
                  >
                    Free Workshop
                  </a>
                  <a
                    href="#audit"
                    className="bg-white text-black border-2 border-black/10 px-8 py-4 rounded-full font-bold text-base hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    $97 AI Audit
                  </a>
                </div>
              </div>

              {/* Right: Headshot + floating stat chips */}
              <div className="relative mt-4 lg:mt-0 flex justify-center">
                {/* ── DROP YOUR HEADSHOT HERE ──
                     Save your photo as public/headshot.png (or .jpg)
                     Recommended: square or 3:4, at least 600px wide */}
                <div className="relative w-72 md:w-80 lg:w-96">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-offWhite border border-black/5 shadow-2xl shadow-black/10">
                    <img
                      src="/headshot2.png"
                      alt="Jentzen, Local Sun Digital"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback when headshot isn't available yet
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                        const fallback = document.createElement('div');
                        fallback.className = 'text-center p-8';
                        fallback.innerHTML = `
                          <svg class="w-16 h-16 text-charcoal/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                          </svg>
                          <p class="text-charcoal/30 text-sm font-semibold">Add headshot.png</p>
                        `;
                        (e.target as HTMLImageElement).parentElement!.appendChild(fallback);
                      }}
                    />
                  </div>

                  {/* Floating stat chips */}
                  <div className="absolute -top-4 -right-4 bg-white border border-black/5 rounded-2xl px-4 py-3 shadow-xl">
                    <p className="text-2xl font-black text-primary leading-none">10+</p>
                    <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider mt-0.5">hrs saved/wk</p>
                  </div>
                  <div className="absolute bottom-12 -left-6 bg-black text-white rounded-2xl px-4 py-3 shadow-xl">
                    <p className="text-2xl font-black text-primary leading-none">$97</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-0.5">AI Audit</p>
                  </div>
                  <div className="absolute top-1/3 -left-8 bg-primary rounded-2xl px-4 py-2.5 shadow-xl hidden md:block">
                    <p className="text-sm font-black text-black leading-none">Free Workshop</p>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mt-0.5">June 17 · 11am PST</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── POLL ── */}
        <section id="poll" className="relative py-16 md:py-24 overflow-hidden">
          {/* Full-width gradient background: cool slate → warm gold */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 via-40% to-amber-600" />
          {/* Subtle animated grain texture */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          {/* Decorative journey arrow line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 hidden lg:block pointer-events-none">
            <svg className="w-full h-8 text-white/10" viewBox="0 0 1200 32" fill="none" preserveAspectRatio="none">
              <path d="M0 16 H1150 L1130 6 M1150 16 L1130 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Where are you on your AI journey?</h2>
              <p className="text-white/50 text-lg font-medium max-w-2xl mx-auto">
                Pick the stage that fits you best. Watch the room fill up live.
              </p>
            </div>
            {/* Journey stage labels */}
            <div className="hidden lg:flex justify-between max-w-4xl mx-auto px-8 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Just starting</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300/70">Full AI power</span>
            </div>
            <PollWidget />
          </div>
        </section>

        {/* ── SECTION DIVIDER ── */}
        <div className="bg-white py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-charcoal/40 text-sm font-bold uppercase tracking-[0.2em]">Now that you know where you stand...</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1 h-px bg-charcoal/10" />
              <ArrowDownIcon />
              <div className="flex-1 h-px bg-charcoal/10" />
            </div>
          </div>
        </div>

        {/* ── ROI CALCULATOR ── */}
        <section id="roi" className="relative py-16 md:py-24 overflow-hidden bg-charcoal">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="max-w-[680px] mx-auto px-6 relative z-10">
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Free Tool</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
                What is manual work<br />
                <span className="text-primary">actually costing you?</span>
              </h2>
              <p className="text-white/40 text-base md:text-lg font-medium max-w-lg leading-relaxed">
                Enter the hours you spend on each task per week. We'll calculate your real cost and what AI agents could recover.
              </p>
            </div>
            <ROICalculator />
          </div>
        </section>

        {/* ── FREE OFFER: WORKSHOP ── */}
        <section id="workshop" className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-offWhite border border-black/5 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5">

                {/* Left: Workshop illustration or image */}
                <div className="lg:col-span-2 relative min-h-[320px] lg:min-h-full overflow-hidden">
                  <img
                    src="/workshop-visual.png"
                    alt="AI Workshop"
                    className="w-full h-full object-cover object-bottom absolute inset-0"
                  />
                  {/* Subtle bottom gradient so the badge text is readable */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  {/* Badge */}
                  <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                    <p className="text-primary font-bold text-sm leading-none">Free Workshop</p>
                    <p className="text-charcoal/50 font-semibold text-xs mt-0.5">June 17 · 11am PST</p>
                  </div>
                </div>

                {/* Right: Content */}
                <div className="lg:col-span-3 p-8 md:p-12">
                  <span className="inline-flex items-center bg-primary/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-5">
                    Free Workshop &middot; June 17 &middot; 11am PST
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-5 tracking-tight leading-[1.1]">
                    AI Agents That Pay For Themselves
                  </h2>
                  <p className="text-charcoal/60 text-lg md:text-xl font-medium mb-8 max-w-2xl leading-relaxed">
                    A practical, no-fluff session on putting AI agents to work in your
                    day-to-day operations. What to automate first, what tools to use,
                    and how to get started without a tech team.
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      { icon: <CalendarIcon />, text: 'June 17 · 11am PST · Save your spot now' },
                      { icon: <ClockIcon />, text: 'Short, practical session, no fluff' },
                      { icon: <SparkIcon />, text: 'Walk away with steps you can use that week' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 text-black">
                          {item.icon}
                        </div>
                        <p className="text-base font-semibold text-charcoal/70">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <QuickForm
                    source="AI Workshop RSVP – June 17"
                    submitLabel="Send Me the Details"
                    loadingLabel="Sending..."
                    successMessage="Check your inbox! We just sent you the link to register and everything you need for June 17."
                    emailOnly
                    finePrint="We'll email you the registration link and workshop details"
                  />
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── LOW-TICKET OFFER: $97 AI AUDIT ── */}
        <section id="audit" className="py-16 md:py-24 bg-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="bg-white rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* Left: Content + form */}
                <div className="p-8 md:p-12">
                  <span className="inline-flex items-center bg-primary/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-5">
                    Limited Spots This Week
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    Book Your 1-Hour AI Audit, $97
                  </h2>
                  <p className="text-charcoal/60 text-lg font-medium mb-8">
                    A focused 1-on-1 session where we look at your business and map out
                    exactly where AI can save you time and money, with a clear plan
                    you can act on immediately.
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      { icon: <TargetIcon />, text: 'Personalized to your business' },
                      { icon: <ClockIcon />, text: '1 hour, focused & actionable' },
                      { icon: <ChecklistIcon />, text: 'Walk away with a clear AI plan' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 text-black">
                          {item.icon}
                        </div>
                        <p className="text-sm font-semibold text-charcoal/70">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <QuickForm
                    source="AI Audit – Event"
                    submitLabel="Book My Audit, $97"
                    loadingLabel="Redirecting to checkout..."
                    successMessage="You're booked! Check your email for next steps."
                    redirectUrl={AUDIT_STRIPE_LINK}
                    finePrint="Secure checkout via Stripe · Pick your time after payment"
                  />
                  <p className="text-charcoal/40 text-xs font-bold uppercase tracking-wider mt-4 text-center">
                    Only a few audit slots available this week. First come, first served.
                  </p>
                </div>

                {/* Right: Audit deliverable preview */}
                <div className="relative bg-offWhite flex items-center justify-center p-8 lg:p-12 min-h-[300px]">
                  {/* ── DROP YOUR AUDIT DELIVERABLE MOCKUP HERE ──
                       Save as public/audit-preview.png
                       Ideas: a stylized 1-page "AI Opportunity Report" cover,
                       a screenshot of the audit output (blurred if needed),
                       or a Loom-style video thumbnail with a play button.
                       Recommended: portrait or square, at least 500px wide. */}
                  <div className="relative w-full max-w-sm">
                    <img
                      src="/audit-preview.png"
                      alt="AI Audit Deliverable Preview"
                      className="w-full rounded-2xl shadow-2xl shadow-black/10 border border-black/5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Fallback: styled document mockup */}
                    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-black/5 p-8 space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-black text-sm">AI Opportunity Report</p>
                          <p className="text-[11px] text-charcoal/40 font-semibold">Your Business Name</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 bg-charcoal/10 rounded-full w-full" />
                        <div className="h-2 bg-charcoal/10 rounded-full w-4/5" />
                        <div className="h-2 bg-charcoal/10 rounded-full w-11/12" />
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-primary/10 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-primary">3</p>
                          <p className="text-[9px] font-bold text-charcoal/40 uppercase">Quick Wins</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-primary">10+</p>
                          <p className="text-[9px] font-bold text-charcoal/40 uppercase">Hrs Saved</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-primary">5</p>
                          <p className="text-[9px] font-bold text-charcoal/40 uppercase">AI Tools</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="h-2 bg-charcoal/10 rounded-full w-3/4" />
                        <div className="h-2 bg-charcoal/10 rounded-full w-full" />
                        <div className="h-2 bg-charcoal/10 rounded-full w-5/6" />
                      </div>
                    </div>

                    {/* Floating price tag */}
                    <div className="absolute -bottom-4 -right-4 bg-black text-white rounded-2xl px-5 py-3 shadow-xl">
                      <p className="text-xl font-black text-primary leading-none">$97</p>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-0.5">one-time</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── SOFT LEAD CAPTURE: NOT READY YET ── */}
        <section className="py-12 bg-offWhite">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">
              Not ready for either? Get our free AI Quick-Start Checklist.
            </h3>
            <p className="text-charcoal/50 font-medium mb-6 text-sm">
              We'll send it straight to your inbox. No strings attached.
            </p>
            <div className="max-w-md mx-auto">
              <QuickForm
                source="AI Checklist – Event"
                submitLabel="Send It to Me"
                loadingLabel="Sending..."
                successMessage="On its way! Check your inbox shortly."
                emailOnly
              />
            </div>
          </div>
        </section>

      </main>

      <EventFooter />
    </div>
  );
};

export default PackagesPage;
