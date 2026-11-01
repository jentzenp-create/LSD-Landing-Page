// Post metadata. Each article body is written in Wordform and pasted into
// content/blog/<slug>.html (see lib/blogContent.ts).
export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    pillar: string;
    date: string; // ISO date
    metaDescription: string;
    keyword: string;
    relatedServiceId?: string;
    image?: string; // featured image URL from Wordform
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
        title: 'Cold Email with Autoresponders: How to Book More Sales Calls on Autopilot',
        excerpt: "Most replies come from the second, third, or fourth email, not the first. Here's how to build an autoresponder sequence that books calls while you run your business.",
        pillar: 'Automation in Practice',
        date: '2026-10-30',
        metaDescription: 'How to build a cold email autoresponder sequence that books sales calls on autopilot: timing, copy, exit rules, metrics, and the mistakes that kill reply rates.',
        keyword: 'cold email autoresponders',
        relatedServiceId: 'lead-generation',
        image: 'https://storage.googleapis.com/wordformai-images/dimg/50bd2bab-7865-4374-9eff-42d0893aa2de.jpg',
    },
    {
        slug: 'ai-powered-seo',
        title: 'AI-Powered SEO: How Small Businesses Get Found on Google and in AI Search',
        excerpt: 'Your next customer might ask ChatGPT instead of Google. Here are seven AI-powered SEO strategies that help small businesses show up in both.',
        pillar: 'AI-Powered Marketing',
        date: '2026-10-28',
        metaDescription: 'Seven AI-powered SEO strategies that help small businesses get found on Google, in Google AI Overviews, and in AI search tools like ChatGPT and Perplexity.',
        keyword: 'AI-powered SEO',
        relatedServiceId: 'seo',
        image: 'https://storage.googleapis.com/wordformai-images/dimg/554870bd-0fd4-43da-baf7-00b8c5853c3c.jpg',
    },
    {
        slug: 'ai-powered-marketing-campaigns',
        title: 'AI-Powered Marketing Campaigns: A Practical Guide for Service Businesses',
        excerpt: 'AI marketing is now affordable for a five-truck plumbing company. Here is a four-step way to launch your first AI campaign and the mistakes that waste money.',
        pillar: 'AI-Powered Marketing',
        date: '2026-10-26',
        metaDescription: 'A practical guide to AI-powered marketing campaigns for service businesses: the core tools, a four-step launch plan, costly mistakes, and the metrics that matter.',
        keyword: 'AI-powered marketing campaigns',
        relatedServiceId: 'ai-automation',
        image: 'https://storage.googleapis.com/wordformai-images/dimg/c753432a-be70-4885-bd89-a4f154588011.jpg',
    },
    {
        slug: 'what-is-an-ai-agent',
        title: 'What Is an AI Agent? A Plain-English Guide for Business Owners',
        excerpt: "A chatbot answers questions. An AI agent gets things done. Here's how agents work, the five common types, and how to start with one safely.",
        pillar: 'AI Demystified',
        date: '2026-11-02',
        metaDescription: 'A plain-English guide to AI agents for business owners: what they are, how they differ from chatbots and automation, common types, and how to get started.',
        keyword: 'what is an AI agent',
        relatedServiceId: 'review-automation',
        image: 'https://storage.googleapis.com/wordformai-images/dimg/0cf7b302-2359-4546-96b2-4c2b6812015d.jpg',
    },
    {
        slug: 'automate-front-desk-tasks',
        title: '7 Front Desk Tasks Your Service Business Can Automate This Month',
        excerpt: 'Every missed call is a customer calling your competitor next. Here are seven front desk tasks to automate, and the order to roll them out in.',
        pillar: 'Automation in Practice',
        date: '2026-11-05',
        metaDescription: 'Seven front desk tasks service businesses can automate this month, from booking and call handling to reminders, payments, and intake, plus a four-week rollout plan.',
        keyword: 'automate front desk tasks',
        relatedServiceId: 'review-automation',
        image: 'https://storage.googleapis.com/wordformai-images/dimg/440c4a9c-c3d3-4d4f-aba2-91136918a5bb.jpg',
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
