
import React from 'react';

const EventFooter: React.FC = () => {
  return (
    <footer className="bg-white py-12 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-4">
        <img src="/logo.png" alt="Local Sun Digital" className="h-10 w-auto" />
        <p className="text-charcoal/60 font-semibold text-sm">
          Jentzen &middot; Local Sun Digital
        </p>
        <a
          href="mailto:jentzen@localsundigital.com"
          className="text-charcoal/40 text-sm font-medium hover:text-primary transition-colors"
        >
          jentzen@localsundigital.com
        </a>
        <p className="text-charcoal/30 text-xs font-semibold">&copy; 2026 Local Sun Digital. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default EventFooter;
