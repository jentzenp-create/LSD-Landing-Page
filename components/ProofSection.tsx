
import React from 'react';

const ProofSection: React.FC = () => {
  const highlights = [
    "More reviews collected consistently",
    "Higher Google visibility",
    "Less stress for staff",
    "Better patient experience"
  ];

  return (
    <section id="proof" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-primary p-12 md:p-20 rounded-holo text-black flex flex-col md:flex-row gap-12 items-center shadow-2xl shadow-primary/10">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Designed for Service Businesses Like Mobile Labs
            </h2>
            <p className="text-black/70 text-lg md:text-xl font-medium mb-8">
              This review system is used by service providers who rely on trust, local search, and repeat business—where reviews directly impact revenue.
            </p>
          </div>
          
          <div className="md:w-1/2 w-full">
            <div className="bg-white text-black p-8 rounded-3xl shadow-xl border border-black/5">
              <h3 className="text-xl font-bold mb-6">What Happens When Review Requests Are Automated</h3>
              <ul className="space-y-4">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#F2B705" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 12l3 3 5-5" stroke="black" />
                    </svg>
                    <span className="font-bold text-charcoal/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProofSection;
