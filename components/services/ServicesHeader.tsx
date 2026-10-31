
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { label: 'Growth Systems', to: '/#systems' },
    { label: 'How It Works', to: '/#process' },
    { label: 'Blog', to: '/blog' },
];

const ServicesHeader: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5' : 'bg-transparent'
                }`}>
                <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <svg width="36" height="36" viewBox="0 0 100 100" className="fill-primary transition-transform group-hover:scale-110">
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
                        <span className="font-bold text-lg sm:text-xl tracking-tight uppercase text-black">
                            Local Sun <span className="text-primary">Digital</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/contact"
                            className="hidden sm:inline-flex bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10"
                        >
                            Book a Call
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isMobileMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </nav>
            </header>

            <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={`absolute top-20 left-0 right-0 bg-white shadow-2xl rounded-b-3xl p-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}>
                    <div className="space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                className="w-full block px-4 py-3 rounded-xl text-lg font-semibold text-charcoal hover:bg-primary/10 hover:text-black transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            to="/contact"
                            className="mt-4 w-full block text-center bg-black text-white px-4 py-4 rounded-full font-bold text-lg"
                        >
                            Book a Call
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServicesHeader;
