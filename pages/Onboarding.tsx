import React from 'react';
import { useParams } from 'react-router-dom';
import OnboardingChat from '../components/onboarding/OnboardingChat';
import { getOnboardingClient } from '../lib/onboardingClients';

const Onboarding: React.FC = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const client = getOnboardingClient(clientSlug);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offWhite px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Onboarding link not found</h1>
          <p className="text-charcoal/60">Double-check the link you were sent, or contact Local Sun Digital.</p>
        </div>
      </div>
    );
  }

  return <OnboardingChat client={client} />;
};

export default Onboarding;
