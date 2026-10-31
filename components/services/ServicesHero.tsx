
import React from 'react';
import { Link } from 'react-router-dom';

const trustPoints = ['Done-for-you setup', 'No long-term contracts', 'Built for service businesses'];

const ServicesHero: React.FC = () => {
    return (
        <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-white to-offWhite min-h-[70vh] flex items-center">
            <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/10 rounded-full blur-[50px] sm:blur-[80px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 sm:px-5 py-2 rounded-full mb-6 sm:mb-8">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-charcoal">AI &amp; Automation for Sales and Marketing</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05] text-black">
                    We install <span className="whitespace-nowrap">AI-powered</span> <span className="text-primary">growth systems</span>
                </h1>

                <p className="text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    Lead capture, follow-up, and marketing that run on autopilot, built and managed for you
                    so your team can focus on closing.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link
                        to="/contact"
                        className="bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10 active:scale-95 w-full sm:w-auto"
                    >
                        Book a Strategy Call
                    </Link>
                    <Link
                        to="/#process"
                        className="bg-white text-black border-2 border-black/10 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:border-primary hover:bg-primary/5 transition-all w-full sm:w-auto"
                    >
                        See How It Works
                    </Link>
                </div>

                <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 text-charcoal/50">
                    {trustPoints.map((point) => (
                        <div key={point} className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-semibold text-sm">{point}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesHero;
