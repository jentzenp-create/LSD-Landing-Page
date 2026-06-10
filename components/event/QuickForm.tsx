
import React, { useState } from 'react';

const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/cj4hQsqqI9fhy6MABW7y/webhook-trigger/3c0a6347-bd55-45e7-882e-d9aa39c54b23';

interface QuickFormProps {
  /** GHL "source" tag so leads can be filtered by which offer they came from */
  source: string;
  /** Label on the submit button, e.g. "Save My Seat" */
  submitLabel: string;
  /** Label while submitting, e.g. "Saving..." */
  loadingLabel?: string;
  /** Message shown after a successful submit (when no redirectUrl) */
  successMessage: string;
  /** If set, the form collects only an email address (used for the checklist strip) */
  emailOnly?: boolean;
  /** If set, browser redirects here after a successful submit (Stripe payment link, Luma, etc.) */
  redirectUrl?: string;
  /** Whether to append ?prefilled_email= to the redirect URL (default: true, used by Stripe) */
  prefillEmail?: boolean;
  /** Optional extra fine-print under the button */
  finePrint?: string;
}

const QuickForm: React.FC<QuickFormProps> = ({
  source,
  submitLabel,
  loadingLabel = 'Submitting...',
  successMessage,
  emailOnly = false,
  redirectUrl,
  prefillEmail = true,
  finePrint,
}) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(GHL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source }),
      });

      if (redirectUrl) {
        if (prefillEmail) {
          const email = encodeURIComponent(formData.email);
          window.location.href = `${redirectUrl}?prefilled_email=${email}`;
        } else {
          window.location.href = redirectUrl;
        }
        return;
      }

      setSubmitted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-bold text-black">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={emailOnly ? 'flex flex-col sm:flex-row gap-3' : 'space-y-4'}>
      {!emailOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Your name"
            className="w-full bg-white border border-black/10 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
          />
          <input
            required
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
            placeholder="Phone number"
            className="w-full bg-white border border-black/10 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
          />
        </div>
      )}

      <input
        required
        name="email"
        value={formData.email}
        onChange={handleChange}
        type="email"
        placeholder="Email address"
        className={`w-full bg-white border border-black/10 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black ${emailOnly ? 'sm:flex-1' : ''}`}
      />

      <button
        type="submit"
        disabled={isLoading}
        className={`bg-black text-white font-bold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          emailOnly ? 'px-8 py-4 whitespace-nowrap' : 'w-full py-5 text-lg'
        }`}
      >
        {isLoading ? loadingLabel : submitLabel}
      </button>

      {finePrint && !emailOnly && (
        <p className="text-center text-charcoal/40 text-xs font-bold uppercase tracking-wider">{finePrint}</p>
      )}
    </form>
  );
};

export default QuickForm;
