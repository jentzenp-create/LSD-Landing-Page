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
}

export const onboardingClients: Record<string, OnboardingClient> = {
  beautyscapes: {
    slug: 'beautyscapes',
    businessName: 'Beautyscapes Landscaping',
    contactName: 'Jose Gonzales',
    industry: 'Landscaping',
  },
};

export function getOnboardingClient(slug: string | undefined): OnboardingClient | undefined {
  if (!slug) return undefined;
  return onboardingClients[slug];
}
