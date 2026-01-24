
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-16 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 100 100" className="fill-primary">
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
            <span className="font-bold text-lg tracking-tight uppercase text-black">Local Sun <span className="text-primary">Digital</span></span>
          </div>
          <p className="text-charcoal/40 text-sm font-semibold">© 2026 Local Sun Digital. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
