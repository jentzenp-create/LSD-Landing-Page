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
            "For a local business, that distinction matters because it's where the time savings actually live. Answering questions is a convenience. Taking action — requesting a review after a job closes, following up with a lead who went quiet, rescheduling a no-show — is what used to require a person remembering to do it at the right moment.",
            "That's also why this isn't science fiction or something only enterprise companies can afford. The systems doing this today are often simple: a trigger (a job marked complete, a form submitted, a missed call) connected to an action (send a text, update a record, notify a human). The \"AI\" part is usually just making the message sound like a person wrote it.",
            "The honest caveat: an agent is only as good as the process behind it. If your follow-up process today is \"whoever remembers to do it,\" automating that inconsistency just makes the inconsistency faster. The businesses getting real value start by mapping the repetitive step they already do by hand, then let an agent handle the parts of it that don't need judgment.",
            "That's exactly the kind of system we build into our <a href=\"/services/review-automation\">review automation</a> and ongoing automation work — not a generic chatbot, but something that takes the specific, repetitive action your business needs taken, on time, every time.",
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
            "<strong>2. Appointment reminders and confirmations.</strong> No-shows are expensive and almost entirely preventable with a reminder sent at the right interval — 24 hours out, then 2 hours out. This is one of the easiest automations to set up and one of the fastest to show up on the bottom line.",
            "<strong>3. New lead follow-up.</strong> The data is consistent across industries: a lead contacted within 5 minutes converts dramatically better than one contacted an hour later. Nobody's front desk can hit that window consistently by hand. An automated first-touch text or email can.",
            "<strong>4. Missed call text-back.</strong> Every missed call is a potential customer who's now calling your competitor. A system that automatically texts a missed caller within seconds (\"Sorry we missed you — how can we help?\") recovers leads that would otherwise just vanish.",
            "<strong>5. Reactivation of old leads.</strong> Most businesses have a list of people who inquired, got quoted, and went quiet. An automated nurture sequence that reaches back out periodically turns a chunk of that \"dead\" list back into booked jobs, with zero manual outreach.",
            "None of these require replacing your team — they require removing the parts of the job that are pure repetition so your team can focus on the parts that need a person. If you want to see what this looks like specifically for your business, that's exactly what we map out in a <a href=\"/contact\">free automation audit</a>.",
        ],
    },
];

export const getPostBySlug = (slug: string): BlogPost | undefined =>
    blogPosts.find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 2): BlogPost[] =>
    blogPosts.filter((p) => p.slug !== slug).slice(0, limit);
