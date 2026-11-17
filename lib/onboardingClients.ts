/**
 * Registry of clients who get an AI onboarding interview page at /onboarding/:slug.
 * Add a new entry here for each new client — no new pages needed.
 */
export interface OnboardingClient {
  slug: string;
  businessName: string;
  contactName: string;
  industry: string;
  /** Optional extra hints injected into the AI's interview instructions (e.g. known specialties). */
  focusHints?: string;
  /** Optional replacement for the default (service-business) interview topics. */
  interviewTopics?: string[];
  /** Optional note on how to read the fixed summary keys for this kind of business. */
  summaryHints?: string;
}

export const onboardingClients: Record<string, OnboardingClient> = {
  beautyscapes: {
    slug: 'beautyscapes',
    businessName: 'Beautyscapes Landscaping',
    contactName: 'Jose Gonzales',
    industry: 'Landscaping',
  },
  'jane-manning': {
    slug: 'jane-manning',
    businessName: 'Jane Manning Art',
    contactName: 'Jane Manning',
    industry: 'Fine art and apparel',
    focusHints:
      'Jane is a painter (SFAI BFA). Her Sea Anatomy series shows human anatomy with botanicals growing through it, acrylic on wood panel. She sells organic, limited-run t-shirts of her paintings under the Sea Anatomy label (about $45 to $55), and a quote-tee line (noted as "Playwright", confirm the spelling) and children\'s books may come later. Some shirts are stocked at a spa as well as at her home. She is warm, creative, says she is not very organized, and feels shy about selling, so keep it encouraging and never salesy. Agency is building her a new site with a full shop and an AI assistant for inventory, orders and planning new work. She will not be editing the site herself, so do not ask about her comfort with editing tools.',
    interviewTopics: [
      'Her story: how she started painting, how Sea Anatomy began, what she hopes people feel, and the one line she wants visitors to remember.',
      'Shirts today: every design, colors, sizes, current price, fabric/organic details, print run sizes, and which designs sell best.',
      'Paintings: which originals are for sale, price ranges, whether she offers prints or commissions, and whether originals should be bought online or by inquiry.',
      'Future lines: the quote-tee line (get the exact name and spelling), children\'s books, and anything else she dreams of selling, plus what should be visible at launch versus later.',
      'Inventory and locations: where stock lives (home, the spa, galleries, pop ups), rough counts, and whether the spa pays her per shirt sold.',
      'Shipping: who packs and ships (name of her helper), from where, packaging, local pickup, international orders, and what she wants to charge for shipping.',
      'Customers: who buys from her, where they discover her (talks, the spa, Instagram, word of mouth), and what they say when they buy.',
      'Look and feel: sites or shops she loves or dislikes, colors, mood, and how the shop should feel to a first-time visitor.',
      'Words and photos: bio, artist statement, favorite quotes, model photos, painting photos, and anything she has already written she wants reused.',
      'Accounts: her current Squarespace site and login situation, the domain, social accounts, and any email list.',
      'The AI assistant: what she would ask it day to day, which business decisions wear her out, and who else (like her shipping helper) should be able to use it, plus whether she prefers texting, voice, or a chat page.',
      'Growth: podcasts or stages she would love to be on, topics she can speak about, past talks, and anything else on her mind.',
    ],
    summaryHints:
      'For this artist, read the summary keys as: serviceAreas = places her work is sold or stocked (online, the spa, galleries, events); servicesOffered = every product line and product; priorityServices = what to feature first at launch; targetCustomers = who buys and where they find her; mustHaveFeatures = shop and assistant features she asked for, including how she wants to talk to the assistant; existingAssets = photos, files, accounts, domain and inventory details; testimonialsAndProof = press, talks, reviews, notable buyers; callToActionPreference = the main action visitors should take; timelineAndBudget = timing and any dates (drops, talks, events) to plan around.',
  },
};

export function getOnboardingClient(slug: string | undefined): OnboardingClient | undefined {
  if (!slug) return undefined;
  return onboardingClients[slug];
}
