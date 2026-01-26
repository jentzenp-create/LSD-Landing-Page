
import React, { useState, useEffect } from 'react';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface ServiceNavigationProps {
    categories: Category[];
}

const ServiceNavigation: React.FC<ServiceNavigationProps> = ({ categories }) => {
    const [activeSection, setActiveSection] = useState<string>('');
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Check if navigation should be sticky
            const navElement = document.getElementById('service-nav');
            if (navElement) {
                const rect = navElement.getBoundingClientRect();
                setIsSticky(rect.top <= 80);
            }

            // Determine active section
            const sections = categories.map(cat => document.getElementById(cat.id));
            const scrollPosition = window.scrollY + 200;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(categories[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div id="service-nav" className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-y border-black/5 shadow-lg shadow-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-2 py-4 overflow-x-auto hide-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => scrollToSection(category.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 ${activeSection === category.id
                                    ? 'bg-primary text-black shadow-lg shadow-primary/30'
                                    : 'bg-offWhite text-charcoal/70 hover:bg-black/5 hover:text-black'
                                }`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
            <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default ServiceNavigation;
