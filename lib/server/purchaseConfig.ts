/**
 * What happens after a Stripe purchase, per package.
 *
 * How a purchase is matched to a package (first match wins):
 *   1. `package` metadata on the Payment Link / Checkout Session, e.g. package = automation-bundle
 *      (Stripe dashboard > Payment Links > your link > Metadata).
 *   2. The Payment Link ID (plink_...) listed in `paymentLinkIds` below.
 *   3. Otherwise DEFAULT_PACKAGE is used, so every buyer still gets a welcome email.
 */
export interface PackageConfig {
  /** Shown in the welcome email, e.g. "Automation Bundle". */
  displayName: string;
  /** Payment Link IDs (plink_...) that map to this package. */
  paymentLinkIds?: string[];
  /** Slug in lib/onboardingClients.ts. If set, the welcome email links to /onboarding/<slug>. */
  onboardingSlug?: string;
  /** Extra "what happens next" bullets for this package, added after the standard ones. */
  extraNextSteps?: string[];
}

export const SITE_URL = 'https://try.localsundigital.com';

/** First name used to sign client emails. */
export const SIGN_OFF_NAME = 'Jentzen';

export const DEFAULT_PACKAGE: PackageConfig = {
  displayName: 'your Local Sun Digital project',
};

export const PACKAGES: Record<string, PackageConfig> = {
  // Example. Copy, rename the key to match the Payment Link's `package` metadata, and edit.
  // 'automation-bundle': {
  //   displayName: 'Automation Bundle',
  //   paymentLinkIds: ['plink_123'],
  //   extraNextSteps: ['We will send access requests for your Google Business Profile.'],
  // },
};

export function resolvePackage(meta: Record<string, string> | null | undefined, paymentLinkId: string | null | undefined) {
  const key = meta?.package?.trim();
  if (key && PACKAGES[key]) return { key, config: PACKAGES[key] };

  if (paymentLinkId) {
    for (const [k, config] of Object.entries(PACKAGES)) {
      if (config.paymentLinkIds?.includes(paymentLinkId)) return { key: k, config };
    }
  }

  // Per-link overrides without editing code: metadata `onboarding_slug` and `package_name`.
  return {
    key: key || 'default',
    config: {
      ...DEFAULT_PACKAGE,
      displayName: meta?.package_name?.trim() || DEFAULT_PACKAGE.displayName,
      onboardingSlug: meta?.onboarding_slug?.trim() || undefined,
    },
  };
}
