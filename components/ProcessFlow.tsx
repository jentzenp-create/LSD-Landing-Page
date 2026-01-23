
import React from 'react';

const ProcessFlow: React.FC = () => {
  const steps = [
    { title: "Complete Appointment", text: "You finish your mobile phlebotomy visit." },
    { title: "Tap 'Service Done'", text: "One click in our portal marks the job." },
    { title: "Automated Follow-up", text: "Polite reminder texts are sent automatically." },
    { title: "Google Reviews", text: "Patients leave reviews while fresh in mind." },
    { title: "Rank Higher", text: "Your lab appears at the top of local search." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">How It Works</h2>
          <p className="text-charcoal/40 text-lg font-medium">Simple, integrated, and effective.</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-center gap-6 bg-offWhite p-6 rounded-2xl border border-black/5 hover:border-primary transition-all group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold border border-black/5 group-hover:bg-primary group-hover:text-black transition-colors shadow-sm">
                {index + 1}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-black">{step.title}</h4>
                <p className="text-charcoal/50 text-sm font-medium">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;
