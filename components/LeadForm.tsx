
import React, { useState } from 'react';

const LeadForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="get-started" className="py-24 bg-offWhite">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Start Getting More Google Reviews—Automatically</h2>
          <p className="text-charcoal/50 text-lg font-medium">Set this up once and let it run in the background while you focus on patient care.</p>
        </div>

        {submitted ? (
          <div className="bg-white border border-primary/20 p-12 rounded-holo text-center shadow-xl">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-black">Thank you!</h3>
            <p className="text-charcoal/60 font-medium">We'll be in touch within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-holo border border-black/5 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black" 
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Business Name</label>
                <input 
                  required
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
                  type="tel" 
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black" 
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/50 ml-1">Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-offWhite border border-black/5 rounded-xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black" 
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-black text-white font-bold py-5 rounded-full text-lg hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg"
            >
              Get More Google Reviews
            </button>
            <p className="text-center mt-6 text-charcoal/40 text-xs font-bold uppercase tracking-wider">
              No contracts. Setup takes less than 15 minutes.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default LeadForm;
