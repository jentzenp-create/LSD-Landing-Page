export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    pillar: string;
    date: string; // ISO date
    metaDescription: string;
    keyword: string;
    relatedServiceId?: string;
    content: string[]; // paragraphs/HTML strings, rendered as-is
}

export const pillars = [
    'AI Demystified',
    'Automation in Practice',
    'AI-Powered Marketing',
    'Client Wins & Proof',
    'Industry & Trends',
] as const;

export const blogPosts: BlogPost[] = [
    {
        slug: 'cold-email-with-autoresponders',
        title: 'Cold Email That Actually Gets Replies: Outreach + Autoresponders',
        excerpt: "Most cold email fails on follow-up, not the first message. Here's how a simple autoresponder system turns outreach into booked calls.",
        pillar: 'Automation in Practice',
        date: '2026-10-30',
        metaDescription: 'How cold email outreach paired with autoresponders and automated follow-up turns cold prospects into booked sales calls for service businesses.',
        keyword: 'cold email autoresponder',
        relatedServiceId: 'lead-generation',
        content: [
            "Cold email has a reputation problem. Most people picture a generic blast that lands in spam and gets ignored. Done that way, it deserves the reputation. Done as a system, it's one of the most predictable ways a service business can fill its calendar.",
            "The difference is almost never the first email. It's what happens after. Most replies come from the second, third, or fourth touch, and most businesses never send them because following up by hand with hundreds of prospects is impossible to keep up with.",
            "<strong>Start with a tight list.</strong> A smaller list of the right businesses beats a giant list of maybe-fits. We build lists around a specific industry, location, and size, so every message can speak to a problem that prospect actually has.",
            "<strong>Write like a person, not a brochure.</strong> Short, specific, and about them. One clear question at the end. AI helps here by researching each prospect and personalizing an opening line, but a human still sets the angle and the offer.",
            "<strong>Let the autoresponders carry the follow-up.</strong> A sequence of three to five messages spaced a few days apart goes out automatically and stops the moment someone replies. Nobody on your team has to remember who to chase.",
            "<strong>Respond to replies instantly.</strong> When a prospect writes back interested, the system can send your booking link right away and alert you. A warm reply that waits a day often goes cold again.",
            "<strong>Protect your sending reputation.</strong> Separate sending domains, warmed-up inboxes, and sensible daily limits keep your messages out of spam and your main business email safe.",
            "Put together, that's not a one-off campaign. It's a sales system that runs every week. If you want to see what that would look like for your market, it's part of our <a href=\"/services/lead-generation\">AI Sales System</a>, and we're happy to <a href=\"/contact\">walk you through it</a>.",
        ],
    },
    {
        slug: 'ai-powered-seo',
        title: 'AI-Powered SEO: What Changed and What Still Works',
        excerpt: "AI didn't kill SEO. It changed where people search and what ranks. Here's what local businesses should focus on now.",
        pillar: 'AI-Powered Marketing',
        date: '2026-10-28',
        metaDescription: 'How AI is changing SEO for local businesses, what still drives rankings, and how AI-powered SEO helps you show up in Google and AI search answers.',
        keyword: 'AI-powered SEO',
        relatedServiceId: 'seo',
        content: [
            "Every few months someone announces that SEO is dead because people ask AI tools instead of searching. The reality is less dramatic: people still search, they now also ask AI assistants, and both reward the same thing. Clear, trustworthy, specific information about what you do and where you do it.",
            "What has changed is the speed and scale of the work. Keyword research, competitor gap analysis, content outlines, and on-page fixes that used to take days can now be done in hours with AI doing the first pass. That frees time for the parts that need judgment.",
            "<strong>Your Google Business Profile still matters most locally.</strong> Accurate categories, services, photos, and a steady flow of fresh reviews are still the fastest way to show up in the map results for nearby searches.",
            "<strong>Answer real questions on your site.</strong> AI search tools pull from pages that answer questions directly. A page that clearly explains your services, pricing approach, service area, and common questions is more likely to be cited than a page of vague marketing language.",
            "<strong>Publish consistently, edit like a human.</strong> AI makes it easy to produce content. It doesn't make it easy to produce content worth reading. The winning approach is AI-assisted drafts, edited for accuracy and voice, published on a steady schedule.",
            "<strong>Fix the technical basics.</strong> Fast pages, mobile-friendly layouts, clean titles and descriptions, and structured data help both search engines and AI tools understand your business.",
            "AI-powered SEO isn't a trick. It's doing the fundamentals faster and more consistently than your competitors. That's how we approach our <a href=\"/services/seo\">AI-Powered SEO</a> work, and this blog is part of that same system.",
        ],
    },
    {
        slug: 'ai-powered-marketing-campaigns',
        title: 'How AI-Powered Marketing Campaigns Work (Without the Hype)',
        excerpt: 'AI can write, target, and test campaigns faster than any team. The trick is pointing it at the right goal. Here is the practical version.',
        pillar: 'AI-Powered Marketing',
        date: '2026-10-26',
        metaDescription: 'A practical look at AI-powered marketing campaigns for service businesses: where AI helps with copy, targeting, and testing, and where people still matter.',
        keyword: 'AI-powered marketing campaigns',
        relatedServiceId: 'ai-automation',
        content: [
            "\"AI-powered marketing\" gets attached to almost everything now. Strip away the buzzwords and it comes down to three jobs AI is genuinely good at: producing variations, finding patterns, and doing repetitive work on schedule.",
            "<strong>Variations.</strong> A campaign used to launch with one or two versions of an ad or email because writing more took too long. AI can draft a dozen angles in minutes. You pick the strongest, test them against each other, and let real results decide.",
            "<strong>Patterns.</strong> Ad platforms and email tools now use AI to learn who responds and adjust targeting and send times automatically. That works best when you feed it a clear goal, like booked calls rather than clicks, and enough data to learn from.",
            "<strong>Repetition.</strong> Seasonal promotions, reactivation emails to past customers, follow-ups after a quote. These are campaigns most businesses mean to run and never get to. Automated, they run every time without anyone remembering.",
            "Where people still matter: choosing the offer, knowing the customer, and deciding what the business actually stands for. AI is a fast assistant, not a strategist. Campaigns built on a weak offer just fail faster.",
            "The campaigns that work best connect to the rest of your system. An ad brings in a lead, an instant reply goes out, follow-up runs until they book, and a review request goes out after the job. That's the growth system we install. <a href=\"/contact\">Book a strategy call</a> and we'll show you where to start.",
        ],
    },
    {
        slug: 'what-is-an-ai-agent',
        title: 'What Is an AI Agent, Actually? (No Jargon)',
        excerpt: "Every software vendor is suddenly selling \"AI agents.\" Here's what the term actually means for a local business, stripped of the hype.",
        pillar: 'AI Demystified',
        date: '2026-11-02',
        metaDescription: "A plain-English explanation of what an AI agent is, how it differs from a chatbot, and where local businesses actually see value from one.",
        keyword: 'what is an AI agent',
        relatedServiceId: 'review-automation',
        content: [
            "If you've scrolled past one more ad promising an \"AI agent\" that will run your business for you, you're not alone in wondering what that actually means. The term gets used for everything from a chatbot widget to a fully autonomous system, which makes it easy to ignore. It shouldn't be.",
            "In plain terms, an AI agent is software that can take an action on its own, not just answer a question. A chatbot tells a customer your hours. An agent books the appointment, sends the confirmation, and follows up if they don't show. The difference is the word \"agent\": it acts, it doesn't just respond.",
            "For a local business, that distinction matters because it's where the time savings actually live. Answering questions is a convenience. Taking action, like requesting a review after a job closes, following up with a lead who went quiet, or rescheduling a no-show, is what used to require a person remembering to do it at the right moment.",
            "That's also why this isn't science fiction or something only enterprise companies can afford. The systems doing this today are often simple: a trigger (a job marked complete, a form submitted, a missed call) connected to an action (send a text, update a record, notify a human). The \"AI\" part is usually just making the message sound like a person wrote it.",
            "The honest caveat: an agent is only as good as the process behind it. If your follow-up process today is \"whoever remembers to do it,\" automating that inconsistency just makes the inconsistency faster. The businesses getting real value start by mapping the repetitive step they already do by hand, then let an agent handle the parts of it that don't need judgment.",
            "That's exactly the kind of system we build into our <a href=\"/services/review-automation\">review automation</a> and ongoing automation work. Not a generic chatbot, but something that takes the specific, repetitive action your business needs taken, on time, every time.",
        ],
    },
    {
        slug: 'automate-front-desk-tasks',
        title: '5 Tasks Your Front Desk Can Automate This Month',
        excerpt: "Your front desk (or you) is doing a handful of repetitive tasks every single day that don't need a human. Here's where to start.",
        pillar: 'Automation in Practice',
        date: '2026-11-05',
        metaDescription: "Five specific front-desk and admin tasks local businesses can automate this month, with no technical background required.",
        keyword: 'automate front desk tasks',
        relatedServiceId: 'review-automation',
        content: [
            "Most local businesses don't need \"AI transformation.\" They need five fewer things to remember to do by hand every day. Here's where we'd start, in order of how fast each one pays for itself.",
            "<strong>1. Review requests.</strong> If a review request depends on someone remembering to send it after every job, it's not getting sent consistently. An automated request that fires the moment a job is marked complete, by text and email, closes that gap without anyone lifting a finger.",
            "<strong>2. Appointment reminders and confirmations.</strong> No-shows are expensive and almost entirely preventable with a reminder sent at the right interval: 24 hours out, then 2 hours out. This is one of the easiest automations to set up and one of the fastest to show up on the bottom line.",
            "<strong>3. New lead follow-up.</strong> The data is consistent across industries: a lead contacted within 5 minutes converts dramatically better than one contacted an hour later. Nobody's front desk can hit that window consistently by hand. An automated first-touch text or email can.",
            "<strong>4. Missed call text-back.</strong> Every missed call is a potential customer who's now calling your competitor. A system that automatically texts a missed caller within seconds (\"Sorry we missed you! How can we help?\") recovers leads that would otherwise just vanish.",
            "<strong>5. Reactivation of old leads.</strong> Most businesses have a list of people who inquired, got quoted, and went quiet. An automated nurture sequence that reaches back out periodically turns a chunk of that \"dead\" list back into booked jobs, with zero manual outreach.",
            "None of these require replacing your team. They require removing the parts of the job that are pure repetition so your team can focus on the parts that need a person. If you want to see what this looks like specifically for your business, that's exactly what we map out in a <a href=\"/contact\">free automation audit</a>.",
        ],
    },
];

// Visitor's local date as YYYY-MM-DD, so a post goes live at local midnight on its date
const todayIso = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getPublishedPosts = (): BlogPost[] => {
    const today = todayIso();
    return blogPosts
        .filter((p) => p.date <= today)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getPostBySlug = (slug: string): BlogPost | undefined =>
    getPublishedPosts().find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 2): BlogPost[] =>
    getPublishedPosts().filter((p) => p.slug !== slug).slice(0, limit);
