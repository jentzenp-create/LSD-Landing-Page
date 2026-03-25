
import React from 'react';

const ServicesHero: React.FC = () => {
    return (
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-white to-offWhite min-h-[60vh] sm:min-h-[70vh] flex items-center">
            {/* Decorative background elements - smaller on mobile */}
            <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/10 rounded-full blur-[50px] sm:blur-[80px] pointer-events-none" />

            {/* Floating icons decoration - hidden on mobile to prevent overlap */}
            <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
                {[
                    { emoji: '⭐', top: '15%', left: '10%', delay: '0s' },
                    { emoji: '🌐', top: '25%', right: '12%', delay: '0.5s' },
                    { emoji: '📈', bottom: '30%', left: '8%', delay: '1s' },
                    { emoji: '📱', top: '40%', right: '8%', delay: '1.5s' },
                    { emoji: '🔍', bottom: '20%', right: '15%', delay: '2s' },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="absolute w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-xl animate-bounce opacity-60"
                        style={{
                            top: item.top,
                            bottom: item.bottom,
                            left: item.left,
                            right: item.right,
                            animationDuration: '3s',
                            animationDelay: item.delay,
                        }}
                    >
                        <span className="text-2xl">{item.emoji}</span>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 sm:px-5 py-2 rounded-full mb-6 sm:mb-8">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-charcoal">Full-Service Digital Agency</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 max-w-5xl mx-auto leading-tight text-black">
                    All Your <span className="text-primary">Digital Growth</span> Services in One Place
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-charcoal/60 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2">
                    From review automation to web design, lead generation to SEO—explore our complete
                    suite of services with transparent pricing and no hidden fees.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
                    <a
                        href="/#services"
                        className="bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10 active:scale-95 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                    >
                        Explore Services
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <a
                        href="/contact"
                        className="bg-white text-black border-2 border-black/10 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:border-primary hover:bg-primary/5 transition-all w-full sm:w-auto"
                    >
                        Get Custom Quote
                    </a>
                </div>

                {/* Trust indicators */}
                <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-charcoal/40">
                    <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-semibold text-xs sm:text-sm">No Hidden Fees</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-semibold text-xs sm:text-sm">Cancel Anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-semibold text-xs sm:text-sm">Trusted by Local Businesses Nationwide</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesHero;
