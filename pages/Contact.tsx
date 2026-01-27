
import React from 'react';
import { Link } from 'react-router-dom';
import ServicesHeader from '../components/services/ServicesHeader';
import { serviceCategories } from './ServicesOverview';

const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader categories={serviceCategories} />
            <main>
                {/* Hero Section */}
                <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-white to-offWhite">
                    {/* Decorative elements */}
                    <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 sm:px-5 py-2 rounded-full mb-6 sm:mb-8">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-xs sm:text-sm font-bold text-charcoal">Let's Connect</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-black">
                            Get in <span className="text-primary">Touch</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-charcoal/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Ready to grow your business? Schedule a free consultation or send us a message. We typically respond within 24 hours.
                        </p>
                    </div>
                </section>

                {/* Contact Options */}
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Calendar Embed Section */}
                            <div className="bg-offWhite rounded-3xl p-8 sm:p-10">
                                <h2 className="text-2xl font-bold text-black mb-4">Schedule a Call</h2>
                                <p className="text-charcoal/60 mb-8">
                                    Book a free 15-minute consultation to discuss your business goals and how we can help.
                                </p>

                                {/* Calendar Embed */}
                                <div className="bg-white rounded-2xl overflow-hidden min-h-[500px]">
                                    <iframe
                                        src="https://api.leadconnectorhq.com/widget/booking/BaehU5q6Dx4fjczoZ9TF"
                                        style={{ width: '100%', height: '600px', border: 'none', overflow: 'hidden' }}
                                        scrolling="no"
                                        id="BaehU5q6Dx4fjczoZ9TF_1769471898131"
                                    />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div className="bg-offWhite rounded-3xl p-8 sm:p-10">
                                    <h2 className="text-2xl font-bold text-black mb-6">Other Ways to Reach Us</h2>

                                    <div className="space-y-6">
                                        {/* Email */}
                                        <a
                                            href="mailto:jentzen@localsundigital.com"
                                            className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:shadow-lg transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-charcoal/40 font-medium">Email us</p>
                                                <p className="text-lg font-bold text-black">jentzen@localsundigital.com</p>
                                            </div>
                                        </a>

                                        {/* Response Time */}
                                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-charcoal/40 font-medium">Response time</p>
                                                <p className="text-lg font-bold text-black">Within 24 hours</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="bg-black rounded-3xl p-8 sm:p-10 text-white">
                                    <h3 className="text-xl font-bold mb-4">Why Work With Us?</h3>
                                    <ul className="space-y-3">
                                        {[
                                            'Trusted by local businesses nationwide',
                                            'No long-term contracts required',
                                            'Transparent pricing, no hidden fees',
                                            'Dedicated support team'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-white/80">
                                                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Back to Services */}
                <section className="py-12 bg-offWhite">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-charcoal/60 hover:text-primary transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Services
                        </Link>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="bg-charcoal py-8">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-white/40 text-sm font-semibold">
                        © 2026 Local Sun Digital. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Contact;
