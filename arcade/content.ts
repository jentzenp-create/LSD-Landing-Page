// Everything the game *says*: industries, questions, findings, automations, bosses.
// World 1 is "Get Found": where each industry's new customers actually come from.
// Each answer has a severity (0 = healthy, 2 = big gap). The results screen
// recommends the automation tied to the player's biggest gap.

export type Industry = 'home' | 'health' | 'pro' | 'retail';

export interface Answer {
  label: string;
  severity: 0 | 1 | 2;
  finding: string;
}

export interface Automation {
  name: string;
  description: (noun: string) => string;
}

export interface Question {
  id: string;
  area: string; // short label used in the report / GHL
  prompt: (noun: string) => string;
  answers: Answer[];
  automation: Automation;
}

export interface BossDef {
  name: string;
  shape: 'pin' | 'ghost' | 'clock';
  intro: string;
  /** What it throws. Has to be instantly recognizable to a business owner. */
  projectile: 'review' | 'email' | 'missed';
  projectileHint: string;
  winWord: string;
}

export type EnemyType = 'grump' | 'cricket' | 'snail' | 'phone';

export interface WorldDef {
  number: 1 | 2;
  theme: 'night' | 'day';
  /** star = static pickups; lead = "hot leads" that go cold if you're slow */
  pickup: 'star' | 'lead';
  enemies: [EnemyType, EnemyType]; // [walker, hopper]
  labels: [string, string, string]; // health label: good / mid / bad
  title: string;
  intro: string;
  diagnosis: string; // "Diagnosis: ___"
  collectible: string; // what the stars represent (plural)
  meter: string;
  questions: Question[]; // last one is asked by the boss
  boss: BossDef;
}

export interface IndustryDef {
  id: Industry;
  label: string;
  examples: string;
  noun: string; // "after a ___"
  world1: WorldDef;
  world2: WorldDef;
}

// ---------------------------------------------------------------- shared pieces

const REVIEW_AUTOPILOT: Automation = {
  name: 'Review Request Autopilot',
  description: (noun) =>
    `Every finished ${noun} automatically gets a friendly text with your review link, plus one reminder if they forget. No remembering, no awkward asking.`,
};

const reviewCount = (id: string): Question => ({
  id,
  area: 'Review count',
  prompt: () => 'How many Google reviews does your business have right now?',
  answers: [
    { label: '100+', severity: 0, finding: 'Strong review base. Keep it fresh: how recent your reviews are matters as much as how many.' },
    { label: '25 to 100', severity: 1, finding: 'Decent review base, but the businesses ranking above you in the map results likely have more, and newer, reviews.' },
    { label: 'Under 25 / not sure', severity: 2, finding: 'A low review count is likely costing you visibility in local search and trust at first glance.' },
  ],
  automation: REVIEW_AUTOPILOT,
});

const reviewAsk = (id: string): Question => ({
  id,
  area: 'Review requests',
  prompt: (noun) => `After a ${noun}, how do customers get asked for a review?`,
  answers: [
    { label: 'Automatic text or email', severity: 0, finding: 'Review requests already run on autopilot. Next lever: replying to every review, automatically drafted.' },
    { label: 'We ask in person, sometimes', severity: 1, finding: 'Asking in person works when someone remembers. Most happy customers never actually get asked.' },
    { label: "We don't really ask", severity: 2, finding: 'No ask means no new reviews. This is one of the easiest automation wins there is.' },
  ],
  automation: REVIEW_AUTOPILOT,
});

const LISTING_BOSS: BossDef = {
  name: 'The Invisible Listing',
  shape: 'pin',
  intro: 'Heh. People search for what you do every single day... and find your competitors instead.',
  projectile: 'review',
  projectileHint: 'Dodge the 1-star reviews!',
  winWord: 'FOUND!',
};

const W1 = {
  number: 1 as const,
  theme: 'night' as const,
  pickup: 'star' as const,
  enemies: ['grump', 'cricket'] as [EnemyType, EnemyType],
  labels: ['Lighthouse', 'Flickering Sign', 'Ghost Town'] as [string, string, string],
};

// ---------------------------------------------------------------- World 2: Speed to Lead

const W2_BASE = {
  number: 2 as const,
  theme: 'day' as const,
  pickup: 'lead' as const,
  enemies: ['snail', 'phone'] as [EnemyType, EnemyType],
  labels: ['Lightning Fast', 'Lukewarm', 'Gone Cold'] as [string, string, string],
  title: 'Sunrise Avenue',
  intro: "The town's lit up and the leads are rolling in! Grab each one before it goes cold.",
  diagnosis: 'Speed to Lead',
  collectible: 'leads',
  meter: 'Response',
  boss: {
    name: 'Captain Later',
    shape: 'clock' as const,
    intro: "A new lead? Relax. Get back to them... next week. They'll wait. (They won't.)",
    projectile: 'missed' as const,
    projectileHint: 'Dodge the missed calls!',
    winWord: 'ANSWERED!',
  },
};

const INSTANT_RESPONDER: Automation = {
  name: 'Instant Lead Responder',
  description: () => 'Every new lead gets a personal text within 60 seconds that answers their first questions and books them straight onto your calendar.',
};

const speedReply = (id: string, channel: string): Question => ({
  id,
  area: 'Response time',
  prompt: () => `When a new ${channel} comes in, how fast does someone usually reply?`,
  answers: [
    { label: 'Under 5 minutes', severity: 0, finding: 'Replying in minutes puts you ahead of almost every competitor. Keep it that way after hours too.' },
    { label: 'Within a few hours', severity: 1, finding: 'A few hours feels fast from the inside, but by then many leads have already reached out to someone else.' },
    { label: 'Next day or later', severity: 2, finding: 'By the next day, most leads have already booked with whoever answered first.' },
  ],
  automation: INSTANT_RESPONDER,
});

const missedCall = (id: string): Question => ({
  id,
  area: 'Missed calls',
  prompt: () => 'What happens when you miss a call?',
  answers: [
    { label: 'They get an automatic text right away', severity: 0, finding: 'Missed calls already turn into conversations. That alone saves deals every week.' },
    { label: 'We call back when we can', severity: 1, finding: 'Callbacks hours later often reach voicemail, and the caller has usually moved on.' },
    { label: 'Voicemail, if they leave one', severity: 2, finding: 'Most callers do not leave a voicemail. They just call the next business on the list.' },
  ],
  automation: {
    name: 'Missed-Call Text-Back',
    description: () => 'Every missed call gets an instant text ("Sorry we missed you, how can we help?") so the conversation keeps going instead of going to a competitor.',
  },
});

const followUp = (id: string, prompt: string): Question => ({
  id,
  area: 'Follow-up',
  prompt: () => prompt,
  answers: [
    { label: '5+ times, automatically', severity: 0, finding: 'Persistent, automated follow-up is where most of the "lost" deals are won back.' },
    { label: 'Once or twice', severity: 1, finding: 'Many leads only reply after several touches. Stopping at one or two leaves money on the table.' },
    { label: 'Usually not at all', severity: 2, finding: 'Without follow-up, every lead who got busy is a lead you lost.' },
  ],
  automation: {
    name: 'Follow-Up Autopilot',
    description: () => 'A friendly series of texts and emails over two to three weeks that stops the moment they reply.',
  },
});

const afterHours = (id: string): Question => ({
  id,
  area: 'After hours',
  prompt: () => 'Who answers new inquiries at 9pm or on a Sunday?',
  answers: [
    { label: 'An AI assistant or answering service', severity: 0, finding: 'You are covered after hours, which is when a lot of people finally have time to reach out.' },
    { label: "They wait until we're back", severity: 1, finding: 'Evening and weekend inquiries wait hours or days, while competitors with instant replies scoop them up.' },
    { label: 'Nobody; they usually move on', severity: 2, finding: 'Every after-hours inquiry is currently a coin flip at best.' },
  ],
  automation: {
    name: '24/7 AI Receptionist',
    description: () => 'Answers calls and messages after hours, handles common questions and books appointments while you sleep.',
  },
});

const yesNoAuto = (id: string, area: string, prompt: string, labels: [string, string, string], findings: [string, string, string], automation: Automation): Question => ({
  id,
  area,
  prompt: () => prompt,
  answers: labels.map((label, i) => ({ label, severity: i as 0 | 1 | 2, finding: findings[i] })),
  automation,
});

const WORLD2: Record<Industry, WorldDef> = {
  home: {
    ...W2_BASE,
    questions: [
      speedReply('home_speed', 'quote request'),
      missedCall('home_missed'),
      yesNoAuto(
        'home_quote_followup',
        'Quote follow-up',
        'You sent a quote and heard nothing back. What happens next?',
        ['Automatic follow-ups until they decide', 'I call once if I remember', "Nothing; the ball's in their court"],
        [
          'Your quotes keep working after you send them. Nice.',
          '"If I remember" follow-up means a lot of good quotes quietly expire.',
          'Unanswered quotes are often just busy people. Without a nudge, they go to whoever followed up.',
        ],
        {
          name: 'Quote Follow-Up Autopilot',
          description: () => 'Open quotes get timed, friendly check-ins by text and email, and you get pinged the moment someone is ready to go.',
        },
      ),
      afterHours('home_after_hours'),
    ],
  },
  health: {
    ...W2_BASE,
    questions: [
      speedReply('health_speed', 'new client inquiry'),
      missedCall('health_missed'),
      followUp('health_followup', "When someone asks about booking but doesn't book, how many times do you follow up?"),
      yesNoAuto(
        'health_reminders',
        'Appointment reminders',
        'Do clients get automatic appointment reminders?',
        ['Text + email, with easy rescheduling', 'We call some of them the day before', 'No reminders'],
        [
          'Automated reminders are protecting your calendar.',
          'Manual reminder calls eat staff time and still miss people.',
          'Without reminders, no-shows quietly drain your schedule.',
        ],
        {
          name: 'No-Show Shield',
          description: () => 'Automatic reminders with one-tap confirm or reschedule, plus a waitlist that fills canceled slots.',
        },
      ),
    ],
  },
  pro: {
    ...W2_BASE,
    questions: [
      speedReply('pro_speed', 'inquiry or consult request'),
      yesNoAuto(
        'pro_booking',
        'Booking a call',
        'How does a prospect book a call with you?',
        ['Self-serve calendar link', 'Back-and-forth emails to find a time', 'Phone tag'],
        [
          'Self-serve booking removes friction right when interest is highest.',
          'Every "does Tuesday work?" email is a chance for the prospect to cool off.',
          'Phone tag loses prospects who were ready to talk today.',
        ],
        {
          name: 'Instant Booking Flow',
          description: () => 'Inquiries get an instant reply with your calendar link and a short intake form, so the call is booked before interest cools.',
        },
      ),
      followUp('pro_proposal_followup', 'After you send a proposal and hear nothing, how many times do you follow up?'),
      yesNoAuto(
        'pro_nurture',
        'Lead nurture',
        "Do prospects who aren't ready yet hear from you regularly?",
        ['Yes, regular newsletter or nurture emails', 'Occasionally', 'Not really'],
        [
          'You stay top of mind until prospects are ready. That compounds.',
          'Occasional contact means some prospects forget you by the time they are ready.',
          "Prospects who weren't ready today often hire someone else six months from now.",
        ],
        {
          name: 'Nurture Sequence',
          description: () => 'Helpful monthly emails written from your expertise that keep you top of mind until prospects are ready to buy.',
        },
      ),
    ],
  },
  retail: {
    ...W2_BASE,
    questions: [
      speedReply('retail_speed', 'message or DM'),
      missedCall('retail_missed'),
      yesNoAuto(
        'retail_online',
        'Online booking',
        'Can customers book, reserve or order online without calling?',
        ['Yes, online 24/7', 'Some things; the rest by phone', 'Phone or walk-in only'],
        [
          'Customers can act the moment they decide. That is exactly when you want them.',
          'Every "call us to book" step loses some people who would have booked online.',
          'Phone-only booking loses everyone who decides outside business hours.',
        ],
        {
          name: 'Online Booking & Ordering',
          description: () => 'Bookings, reservations or orders straight from your website, Google profile and Instagram, with instant confirmations.',
        },
      ),
      afterHours('retail_after_hours'),
    ],
  },
};

// ---------------------------------------------------------------- industries

export const INDUSTRIES: IndustryDef[] = ([
  {
    id: 'home',
    label: 'Home Services',
    examples: 'Plumbing, HVAC, roofing, cleaning, landscaping',
    noun: 'job',
    world1: {
      ...W1,
      title: 'Ghost Town',
      intro: 'Nobody can find this town on Google. Collect reviews to light it up!',
      diagnosis: 'Getting Found on Google',
      collectible: 'reviews',
      meter: 'Visibility',
      boss: LISTING_BOSS,
      questions: [
        {
          id: 'home_gbp',
          area: 'Google Business Profile',
          prompt: () => 'How active is your Google Business Profile (posts, photos, hours)?',
          answers: [
            { label: 'Updated every month', severity: 0, finding: 'Active profile. Google favors listings that are kept complete and current.' },
            { label: 'Set up, rarely touched', severity: 1, finding: 'A stale profile quietly signals "maybe closed." Fresh posts and photos fix that.' },
            { label: 'Not sure I have one', severity: 2, finding: 'Your Google Business Profile is one of the most important free tools for getting local calls. Claiming and maintaining it is step one.' },
          ],
          automation: {
            name: 'Google Profile Autopilot',
            description: () => 'Fresh posts, job photos and Q&A published to your Google profile every week, written for you and approved with one tap.',
          },
        },
        reviewCount('home_review_count'),
        reviewAsk('home_review_ask'),
        {
          id: 'home_website',
          area: 'Website quote requests',
          prompt: () => 'Can someone on their phone request a quote from your website in under a minute?',
          answers: [
            { label: 'Yes, and they get an instant reply', severity: 0, finding: 'Your website converts and responds fast. That is rarer than you would think.' },
            { label: "There's a form; replies take a while", severity: 1, finding: 'A slow reply gives that visitor time to call the next company on the list.' },
            { label: 'Not really / no website', severity: 2, finding: "If they can't ask for a quote in seconds, most visitors leave and call someone who makes it easy." },
          ],
          automation: {
            name: 'Instant Quote Responder',
            description: () => 'Every quote request gets a text back within seconds with a few smart questions and your booking link, day or night.',
          },
        },
      ],
    },
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    examples: 'Med spas, chiropractors, dentists, gyms, therapists',
    noun: 'appointment',
    world1: {
      ...W1,
      title: 'Ghost Town',
      intro: 'New clients cannot find this town. Collect reviews to light it up!',
      diagnosis: 'Getting Found & Booked',
      collectible: 'reviews',
      meter: 'Visibility',
      boss: LISTING_BOSS,
      questions: [
        {
          id: 'health_booking',
          area: 'Online booking',
          prompt: () => 'Can a new client book with you online at 10pm on a Sunday?',
          answers: [
            { label: 'Yes, they pick a time themselves', severity: 0, finding: 'Self-booking is live. Now make sure every booking gets reminders so it actually shows up.' },
            { label: 'They request, we call back', severity: 1, finding: 'Every callback is a chance for them to book with whoever answered first.' },
            { label: 'Phone only', severity: 2, finding: 'Phone-only booking loses the people who are ready to book outside business hours.' },
          ],
          automation: {
            name: '24/7 AI Booking Assistant',
            description: () => 'Answers questions and books new clients straight into your calendar by text or web chat, any hour, with reminders that cut no-shows.',
          },
        },
        reviewCount('health_review_count'),
        reviewAsk('health_review_ask'),
        {
          id: 'health_social',
          area: 'Social media',
          prompt: () => 'How often do you post on Instagram or Facebook?',
          answers: [
            { label: 'Every week', severity: 0, finding: 'Consistent posting keeps you top of mind. Next step: turn comments and DMs into bookings automatically.' },
            { label: 'A few times a month', severity: 1, finding: 'Patchy posting makes it hard to build momentum. A simple content system fixes that.' },
            { label: 'Rarely or never', severity: 2, finding: 'People check your social before they book. An empty feed makes them wonder if you are still open.' },
          ],
          automation: {
            name: 'AI Content Engine',
            description: () => 'A month of on-brand posts drafted from your services and reviews, scheduled automatically. You just approve.',
          },
        },
      ],
    },
  },
  {
    id: 'pro',
    label: 'Professional Services',
    examples: 'Accounting, legal, consulting, agencies, financial advisors',
    noun: 'project',
    world1: {
      ...W1,
      title: 'Quiet Street',
      intro: "The phone isn't ringing on this street. Collect leads to light up your pipeline!",
      diagnosis: 'Lead Generation & Outreach',
      collectible: 'leads',
      meter: 'Pipeline',
      boss: {
        name: 'The Ghoster',
        shape: 'ghost',
        intro: "Boo. You sent one email, I never replied... and you never followed up. We're even.",
        projectile: 'email',
        projectileHint: 'Dodge the unanswered emails!',
        winWord: 'BOOKED!',
      },
      questions: [
        {
          id: 'pro_outreach_volume',
          area: 'Outbound volume',
          prompt: () => 'In a typical week, how many new prospects do you reach out to?',
          answers: [
            { label: '50+, with a system', severity: 0, finding: 'You have real outbound volume. The next gain is in follow-up and personalization at scale.' },
            { label: 'A handful, when I have time', severity: 1, finding: '"When I have time" outreach means your pipeline rises and falls with your workload.' },
            { label: 'Zero, we wait for referrals', severity: 2, finding: 'Referral-only growth means you do not control when the next client shows up.' },
          ],
          automation: {
            name: 'AI Outbound Engine',
            description: () => 'Finds prospects that fit your ideal client, researches each one, and drafts personal first lines for you to send.',
          },
        },
        {
          id: 'pro_cold_email',
          area: 'Cold email',
          prompt: () => 'Do you have a cold email campaign running right now?',
          answers: [
            { label: 'Yes, on its own domains', severity: 0, finding: 'Proper cold email setup. Watch reply rates and keep lists fresh.' },
            { label: 'Tried it, it fizzled', severity: 1, finding: 'Most cold email "fails" on setup: deliverability, list quality and follow-ups, not the idea itself.' },
            { label: 'Never', severity: 2, finding: 'Cold email is one of the cheapest ways to start conversations with decision-makers who have never heard of you.' },
          ],
          automation: {
            name: 'Cold Email Infrastructure',
            description: () => 'Separate sending domains, warmed inboxes, targeted lists and automatic follow-ups, so you land in the inbox, not spam.',
          },
        },
        {
          id: 'pro_linkedin',
          area: 'LinkedIn presence',
          prompt: () => 'How would you describe your LinkedIn presence?',
          answers: [
            { label: 'Post weekly, get inbound', severity: 0, finding: 'LinkedIn is working for you. Make sure inbound conversations get followed up fast.' },
            { label: 'Profile is fine, rarely post', severity: 1, finding: 'A quiet profile gets checked and forgotten. Regular posts keep you in your network\'s feed.' },
            { label: "Haven't touched it in ages", severity: 2, finding: 'Prospects look you up before they reply. An outdated LinkedIn undercuts everything else you send.' },
          ],
          automation: {
            name: 'LinkedIn Content Engine',
            description: () => 'Turns your expertise into weekly LinkedIn posts in your voice, drafted from a 15-minute monthly conversation.',
          },
        },
        {
          id: 'pro_referrals',
          area: 'Referral requests',
          prompt: () => 'How do you ask happy clients for referrals?',
          answers: [
            { label: 'Automatically, at the right moment', severity: 0, finding: 'A referral system is your cheapest lead source. Keep feeding it.' },
            { label: 'I ask sometimes', severity: 1, finding: 'Your happiest clients would refer you, but most are never asked at the right moment.' },
            { label: "I don't ask", severity: 2, finding: 'Not asking leaves your best lead source to chance.' },
          ],
          automation: {
            name: 'Referral Request Autopilot',
            description: (noun) => `When a ${noun} wraps up well, clients get a personal thank-you and an easy way to introduce you. Intros land in your inbox ready to book.`,
          },
        },
      ],
    },
  },
  {
    id: 'retail',
    label: 'Retail & Hospitality',
    examples: 'Restaurants, shops, salons, hotels, venues',
    noun: 'visit',
    world1: {
      ...W1,
      title: 'Ghost Town',
      intro: 'Nobody can find this town. Collect reviews to bring the crowds back!',
      diagnosis: 'Getting Found & Coming Back',
      collectible: 'reviews',
      meter: 'Visibility',
      boss: LISTING_BOSS,
      questions: [
        reviewCount('retail_review_count'),
        reviewAsk('retail_review_ask'),
        {
          id: 'retail_social',
          area: 'Social media',
          prompt: () => 'How often do you post on Instagram, TikTok or Facebook?',
          answers: [
            { label: 'Several times a week', severity: 0, finding: 'Strong social presence. Now turn followers into a list you own.' },
            { label: 'A few times a month', severity: 1, finding: 'Inconsistent posting means the algorithm forgets you between posts.' },
            { label: 'Rarely or never', severity: 2, finding: 'People check your feed to decide whether to visit. A quiet feed sends them elsewhere.' },
          ],
          automation: {
            name: 'AI Content Engine',
            description: () => 'A month of on-brand posts drafted from your menu, products and reviews, scheduled automatically. You just approve.',
          },
        },
        {
          id: 'retail_list',
          area: 'Customer list',
          prompt: () => 'Do you have a text or email list of past customers that you message?',
          answers: [
            { label: 'Yes, we send regular offers', severity: 0, finding: 'You own your audience. Segment it so the right offer reaches the right people.' },
            { label: 'We collect some, rarely send', severity: 1, finding: 'A list you never message slowly goes cold. Regular, simple offers keep it valuable.' },
            { label: 'No list', severity: 2, finding: 'Without a list, every customer has to rediscover you on their own.' },
          ],
          automation: {
            name: 'SMS Win-Back Club',
            description: (noun) => `Collects numbers at checkout and automatically texts a "we miss you" offer to anyone who hasn't had a ${noun} in a while.`,
          },
        },
      ],
    },
  },
] as Omit<IndustryDef, 'world2'>[]).map((ind) => ({ ...ind, world2: WORLD2[ind.id] }));

export function getIndustry(id: Industry): IndustryDef {
  return INDUSTRIES.find((i) => i.id === id) ?? INDUSTRIES[0];
}

export function getWorld(id: Industry, n: 1 | 2): WorldDef {
  const ind = getIndustry(id);
  return n === 1 ? ind.world1 : ind.world2;
}

export function healthScore(severities: number[], labels: [string, string, string] = W1.labels) {
  const total = severities.reduce((a, b) => a + b, 0);
  const max = severities.length * 2 || 1;
  const score = Math.round(100 - (total / max) * 84); // 16..100
  const label = score >= 80 ? labels[0] : score >= 50 ? labels[1] : labels[2];
  return { score, label, total };
}
