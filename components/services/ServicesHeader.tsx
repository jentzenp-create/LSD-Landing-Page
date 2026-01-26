
import React, { useState, useEffect } from 'react';

interface Category {
    id: string;
    name: string;
}

interface ServicesHeaderProps {
    categories: Category[];
}

const ServicesHeader: React.FC<ServicesHeaderProps> = ({ categories }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5' : 'bg-transparent'
                }`}>
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 group">
                        {/* SVG Logo */}
                        <svg width="40" height="40" viewBox="0 0 100 100" className="fill-primary transition-transform group-hover:scale-110">
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
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
                        {categories.slice(0, 4).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => scrollToSection(category.id)}
                                className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors relative group"
                            >
                                {category.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </button>
                        ))}
                        {categories.length > 4 && (
                            <button
                                onClick={() => scrollToSection(categories[4].id)}
                                className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors relative group"
                            >
                                More
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </button>
                        )}
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center gap-4">
                        <a
                            href="#contact"
                            className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10"
                        >
                            Get a Quote
                        </a>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
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

            {/* Mobile Menu */}
            <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={`absolute top-20 left-0 right-0 bg-white shadow-2xl rounded-b-3xl p-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => scrollToSection(category.id)}
                                className="w-full text-left px-4 py-3 rounded-xl text-lg font-semibold text-charcoal hover:bg-primary/10 hover:text-black transition-colors flex items-center gap-3"
                            >
                                <span className="text-primary">→</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServicesHeader;
