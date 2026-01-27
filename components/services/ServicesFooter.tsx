
import React from 'react';

const ServicesFooter: React.FC = () => {
    return (
        <>
            {/* CTA Section */}
            <section id="contact" className="py-24 bg-black relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                        Ready to <span className="text-primary">Grow</span> Your Business?
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
                        Not sure which services are right for you? Let's chat. We'll create a custom
                        package tailored to your goals and budget.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="tel:+1234567890"
                            className="bg-primary text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-primary/30 active:scale-95 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Schedule a Call
                        </a>
                        <a
                            href="mailto:jentzen@localsundigital.com"
                            className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all w-full sm:w-auto"
                        >
                            Send an Email
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-white/40">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black text-white">🇺🇸</span>
                            <span className="text-sm font-medium">Nationwide Service</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black text-white">5★</span>
                            <span className="text-sm font-medium">Average Rating</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black text-white">24hr</span>
                            <span className="text-sm font-medium">Response Time</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black text-white">$0</span>
                            <span className="text-sm font-medium">Hidden Fees</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-charcoal py-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
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
                                <span className="font-bold text-lg tracking-tight uppercase text-white">
                                    Local Sun <span className="text-primary">Digital</span>
                                </span>
                            </div>
                            <p className="text-white/40 text-sm font-semibold">
                                © 2026 Local Sun Digital. All rights reserved.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm font-semibold">
                            <a href="/" className="hover:text-primary transition-colors">Home</a>
                            <a href="#review-automation" className="hover:text-primary transition-colors">Services</a>
                            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
                            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default ServicesFooter;
