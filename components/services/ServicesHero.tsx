
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const trustPoints = ['Done-for-you setup', 'No long-term contracts', 'Built for service businesses'];

const ease = [0.22, 1, 0.36, 1] as const;
const enter = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease },
});

const ServicesHero: React.FC = () => {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
    const blobsY = useTransform(scrollYProgress, [0, 1], [0, -120]);

    return (
        <section
            ref={ref}
            className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-white to-offWhite min-h-[88vh] flex items-center"
            style={{ contentVisibility: 'visible' }}
        >
            <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
            <motion.div style={{ y: blobsY }} className="absolute inset-0 pointer-events-none">
                <div className="blob w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] bg-primary/25 top-[8%] left-[2%] sm:left-[10%]" />
                <div className="blob w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] bg-orange-400/20 bottom-[5%] right-[0%] sm:right-[8%]" style={{ animationDelay: '-7s' }} />
                <div className="blob w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-amber-200/40 top-[35%] right-[30%]" style={{ animationDelay: '-12s' }} />
            </motion.div>

            <motion.div
                style={{ y: contentY, opacity: contentOpacity }}
                className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full text-center"
            >
                <motion.div {...enter(0)} className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-primary/30 px-4 sm:px-5 py-2 rounded-full mb-6 sm:mb-8 shadow-sm">
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                        <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-charcoal">AI &amp; Automation for Sales and Marketing</span>
                </motion.div>

                <motion.h1 {...enter(0.1)} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05] text-black">
                    We install <span className="whitespace-nowrap">AI-powered</span>{' '}
                    <span className="text-gradient-sun">growth systems</span>
                </motion.h1>

                <motion.p {...enter(0.2)} className="text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    Lead capture, follow-up, and marketing that run on autopilot, built and managed for you
                    so your team can focus on closing.
                </motion.p>

                <motion.div {...enter(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link
                        to="/contact"
                        className="btn-shine group bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-2xl shadow-black/20 hover:shadow-primary/40 active:scale-95 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                    >
                        Book a Strategy Call
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <Link
                        to="/#process"
                        className="bg-white/80 backdrop-blur text-black border-2 border-black/10 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:border-primary hover:bg-primary/5 transition-all w-full sm:w-auto"
                    >
                        See How It Works
                    </Link>
                </motion.div>

                <motion.div {...enter(0.4)} className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 text-charcoal/50">
                    {trustPoints.map((point) => (
                        <div key={point} className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-semibold text-sm">{point}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            <motion.a
                href="#systems"
                aria-label="Scroll to growth systems"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 w-7 h-11 rounded-full border-2 border-black/20 justify-center pt-2"
            >
                <span className="w-1 h-2.5 rounded-full bg-primary animate-gentle-bounce" />
            </motion.a>
        </section>
    );
};

export default ServicesHero;
