
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* SVG Logo Representation of Local Sun Digital */}
          <svg width="40" height="40" viewBox="0 0 100 100" className="fill-primary">
            <circle cx="50" cy="50" r="20" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <rect
                key={angle}
                x="47"
                y="15"
                width="6"
                height="15"
                rx="3"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </svg>
          <span className="font-bold text-xl tracking-tight hidden sm:block uppercase text-black">
            Local Sun <span className="text-primary">Digital</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors">How it Works</a>
          <a href="#proof" className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors">Results</a>
        </div>

        <a
          href="#pricing"
          className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95"
        >
          Sign Up
        </a>
      </nav>
    </header>
  );
};

export default Header;
