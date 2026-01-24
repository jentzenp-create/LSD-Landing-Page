
import React, { useState } from 'react';

declare global {
  interface Window {
    Stripe?: any;
  }
}

const PricingSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Send data to GoHighLevel Webhook first
      await fetch('https://services.leadconnectorhq.com/hooks/cj4hQsqqI9fhy6MABW7y/webhook-trigger/3c0a6347-bd55-45e7-882e-d9aa39c54b23', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'Landing Page'
        }),
      });

      // 2. Redirect to Stripe Payment Link with pre-filled email
      const stripePaymentLink = 'https://buy.stripe.com/cNi00jbNi5TE9yWb2U0kE0f';
      const prefilledEmail = encodeURIComponent(formData.email);
      window.location.href = `${stripePaymentLink}?prefilled_email=${prefilledEmail}`;
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForm) {
    return (
      <section id="pricing" className="py-24 bg-offWhite">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(false)}
              className="text-primary font-bold text-sm uppercase tracking-widest mb-4 hover:opacity-80 transition-opacity flex items-center justify-center gap-2 mx-auto"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Pricing
            </button>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Complete Your Sign Up</h2>
            <p className="text-charcoal/50 text-lg font-medium">Just a few details to get your automated review system running.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-holo border border-black/5 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Business Name</label>
                <input
                  required
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  type="text"
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  placeholder="Acme Mobile Labs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Phone Number</label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Email</label>
                <input
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold py-5 rounded-full text-lg hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Continue to Secure Payment'}
            </button>
            <p className="text-center mt-6 text-charcoal/40 text-xs font-bold uppercase tracking-wider">
              No contracts. Trusted A2P Verified Messaging.
            </p>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black">Simple, Transparent Pricing</h2>
          <p className="text-charcoal/50 text-xl font-medium max-w-2xl mx-auto">
            Everything you need to automate your Google reviews and grow your business reputation.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative p-1 bg-gradient-to-br from-primary via-primary/50 to-primary/10 rounded-[32px] shadow-2xl">
            <div className="bg-white rounded-[28px] p-10 md:p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">Growth Plan</h3>
                  <p className="text-charcoal/50 font-medium">Perfect for small businesses</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20">
                  Most Popular
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-black">$99</span>
                  <span className="text-charcoal/40 font-bold text-lg">/month</span>
                </div>
                <p className="text-primary font-bold mt-2">$0 Setup Fee</p>
              </div>

              <div className="space-y-5 mb-10">
                {[
                  'Automated Google Review Requests',
                  'Instant SMS & Email Notifications',
                  'No Contracts—Cancel Anytime',
                  'Custom Review Landing Page',
                  'Negative Feedback Shield',
                  'A2P Verified Messaging'
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-charcoal/70 font-semibold">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-black text-white font-bold py-5 rounded-full text-xl hover:scale-102 active:scale-0.98] transition-all shadow-xl hover:shadow-primary/20"
              >
                Sign Up Now
              </button>

              <p className="text-center mt-6 text-charcoal/40 text-xs font-bold uppercase tracking-widest">
                Trusted A2P Onboarding
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
