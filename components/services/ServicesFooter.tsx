
import React from 'react';
import { Reveal } from './Motion';

const footerLinks = [
    { label: 'Home', href: '/' },
    { label: 'Growth Systems', href: '/#systems' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
];

const ServicesFooter: React.FC = () => {
    return (
        <>
            <section id="contact" className="py-24 sm:py-32 bg-black relative overflow-hidden">
                <div className="blob w-[420px] h-[420px] bg-primary/30 -top-40 -left-32" />
                <div className="blob w-[360px] h-[360px] bg-orange-500/20 -bottom-40 -right-24" style={{ animationDelay: '-6s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,183,5,0.08),transparent_60%)] pointer-events-none" />

                <Reveal className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
                        Ready to put growth on <span className="text-gradient-sun">autopilot</span>?
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
                        Book a free strategy call. We'll find where leads are slipping through and show you
                        the system that fixes it.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="/contact"
                            className="btn-shine bg-primary text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 hover:shadow-primary/50 transition-all shadow-2xl shadow-primary/30 active:scale-95 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Book a Strategy Call
                        </a>
                        <a
                            href="mailto:jentzen@localsundigital.com"
                            className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 hover:border-primary/60 transition-all w-full sm:w-auto"
                        >
                            Send an Email
                        </a>
                    </div>
                </Reveal>
            </section>

            <footer className="bg-charcoal py-14 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <a href="/" aria-label="Local Sun Digital home">
                                <img src="/logo-light.png" alt="Local Sun Digital" width={1405} height={427} className="h-10 w-auto" />
                            </a>
                            <p className="text-white/40 text-sm font-semibold">
                                © 2026 Local Sun Digital. All rights reserved.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm font-semibold">
                            {footerLinks.map((link) => (
                                <a key={link.label} href={link.href} className="hover:text-primary transition-colors">
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default ServicesFooter;
