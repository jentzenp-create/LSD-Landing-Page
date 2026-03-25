
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white min-h-[90vh] flex items-center">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
        {/* Radiating Graphic Element inspired by CoreShift */}
        <div className="relative h-64 mb-12 flex justify-center items-center">
          {/* Central Hub */}
          <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center shadow-[0_10px_40px_rgba(242,183,5,0.4)] z-20 will-change-transform">
            <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Radiating Nodes - repositioned for better line alignment */}
          {/* Top Left */}
          <div className="absolute top-2 left-[20%] animate-bounce will-change-transform" style={{ animationDuration: '3s' }}>
            <div className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">📱</span>
            </div>
          </div>

          {/* Bottom Left */}
          <div className="absolute bottom-2 left-[28%] animate-pulse will-change-transform" style={{ animationDuration: '4s' }}>
            <div className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">💬</span>
            </div>
          </div>

          {/* Top Right */}
          <div className="absolute top-2 right-[20%] animate-bounce will-change-transform" style={{ animationDuration: '3.5s' }}>
            <div className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">⭐</span>
            </div>
          </div>

          {/* Bottom Right */}
          <div className="absolute bottom-2 right-[28%] animate-pulse will-change-transform" style={{ animationDuration: '2.5s' }}>
            <div className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">📈</span>
            </div>
          </div>

          {/* Decorative Connecting Lines - adjusted positions */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
            <line x1="27%" y1="15%" x2="50%" y2="50%" stroke="#F2B705" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="35%" y1="85%" x2="50%" y2="50%" stroke="#F2B705" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="73%" y1="15%" x2="50%" y2="50%" stroke="#F2B705" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="65%" y1="85%" x2="50%" y2="50%" stroke="#F2B705" strokeWidth="1.5" strokeDasharray="6 6" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-tight text-black">
          Get More <span className="text-primary">5-Star Google Reviews</span> Without Asking Patients Face-to-Face
        </h1>
        <p className="text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Let automated texts follow up for you after each visit—no uncomfortable conversations required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10 active:scale-95 w-full sm:w-auto"
          >
            Automate My Review Requests
          </a>
          <p className="text-sm text-charcoal/40 font-semibold">
            Fully automated messaging.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
