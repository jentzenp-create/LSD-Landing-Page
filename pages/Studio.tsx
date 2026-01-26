
import React, { useState, useEffect } from 'react';
import { useContent } from '../hooks/useContent';
import { supabase } from '../lib/supabase';
import { polishText } from '../lib/ai';

// Define all editable content fields organized by page/section
const allFields = [
    // Services Overview Page - Hero
    { key: 'services_hero_badge', label: 'Badge Text', section: 'Services Overview', placeholder: 'Full-Service Digital Agency' },
    { key: 'services_hero_title', label: 'Main Headline', section: 'Services Overview', placeholder: 'All Your Digital Growth Services in One Place' },
    { key: 'services_hero_subtitle', label: 'Sub-headline', section: 'Services Overview', placeholder: 'From review automation to web design...' },
    { key: 'services_hero_cta_primary', label: 'Primary Button', section: 'Services Overview', placeholder: 'Explore Services' },
    { key: 'services_hero_cta_secondary', label: 'Secondary Button', section: 'Services Overview', placeholder: 'Get Custom Quote' },

    // Services Overview - Section Headings
    { key: 'services_grid_title', label: 'Services Section Title', section: 'Services Overview', placeholder: 'Our Services' },
    { key: 'services_grid_subtitle', label: 'Services Section Subtitle', section: 'Services Overview', placeholder: 'Explore our full suite of digital growth solutions...' },
    { key: 'services_cta_title', label: 'Bottom CTA Title', section: 'Services Overview', placeholder: 'Not Sure Where to Start?' },
    { key: 'services_cta_subtitle', label: 'Bottom CTA Subtitle', section: 'Services Overview', placeholder: 'Book a free consultation...' },
    { key: 'services_cta_button', label: 'Bottom CTA Button', section: 'Services Overview', placeholder: 'Get Free Consultation' },

    // Service Detail Pages
    { key: 'detail_stats_clients', label: 'Stats - Happy Clients', section: 'Service Details', placeholder: '50+' },
    { key: 'detail_stats_rating', label: 'Stats - Average Rating', section: 'Service Details', placeholder: '4.9★' },
    { key: 'detail_stats_growth', label: 'Stats - Growth Rate', section: 'Service Details', placeholder: '2x' },
    { key: 'detail_testimonial', label: 'Testimonial Quote', section: 'Service Details', placeholder: 'Working with Local Sun Digital transformed our business...' },
    { key: 'detail_testimonial_author', label: 'Testimonial Author', section: 'Service Details', placeholder: 'Satisfied Client' },
    { key: 'detail_testimonial_role', label: 'Testimonial Role', section: 'Service Details', placeholder: 'Local Business Owner' },
    { key: 'detail_pricing_title', label: 'Pricing Section Title', section: 'Service Details', placeholder: 'Choose Your Plan' },
    { key: 'detail_pricing_subtitle', label: 'Pricing Section Subtitle', section: 'Service Details', placeholder: 'Transparent pricing with no hidden fees...' },
    { key: 'detail_cta_title', label: 'Bottom CTA Title', section: 'Service Details', placeholder: 'Ready to Get Started?' },
    { key: 'detail_cta_subtitle', label: 'Bottom CTA Subtitle', section: 'Service Details', placeholder: 'Book a free consultation...' },
    { key: 'detail_cta_button', label: 'Bottom CTA Button', section: 'Service Details', placeholder: 'Book Free Consultation' },

    // Mobile Lab Page (Original Landing Page)
    { key: 'hero_title', label: 'Main Headline', section: 'Mobile Lab', placeholder: 'Get More 5-Star Google Reviews...' },
    { key: 'hero_subtitle', label: 'Sub-headline', section: 'Mobile Lab', placeholder: 'Let automated texts follow up...' },
    { key: 'cta_button', label: 'Main Button Text', section: 'Mobile Lab', placeholder: 'Automate My Review Requests' },

    // Footer / Global
    { key: 'footer_tagline', label: 'Footer Tagline', section: 'Global', placeholder: 'Helping local businesses thrive in the digital age.' },
    { key: 'footer_copyright', label: 'Copyright Text', section: 'Global', placeholder: '© 2026 Local Sun Digital. All rights reserved.' },
    { key: 'company_phone', label: 'Phone Number', section: 'Global', placeholder: '(555) 123-4567' },
    { key: 'company_email', label: 'Email Address', section: 'Global', placeholder: 'hello@localsundigital.com' },
];

const Studio: React.FC = () => {
    const { content, loading, updateContent } = useContent();
    const [editableContent, setEditableContent] = useState<Record<string, string>>({});
    const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
    const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState('Services Overview');
    const [polishingKey, setPolishingKey] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (Object.keys(content).length > 0) {
            setEditableContent(content);
        }
    }, [content]);

    // Get unique sections
    const sections = [...new Set(allFields.map(f => f.section))];

    const handleTextChange = (key: string, value: string) => {
        setEditableContent(prev => ({ ...prev, [key]: value }));
        // Remove from saved state when user edits
        setSavedKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    };

    const handlePolish = async (key: string) => {
        setPolishingKey(key);
        try {
            const currentText = editableContent[key] || '';
            const polished = await polishText(currentText, activeSection);
            setEditableContent(prev => ({ ...prev, [key]: polished }));
        } finally {
            setPolishingKey(null);
        }
    };

    const handleSave = async (key: string) => {
        setSavingKeys(prev => new Set(prev).add(key));

        // Check if the key exists in database first
        const { data: existing } = await supabase
            .from('website_content')
            .select('key')
            .eq('key', key)
            .single();

        if (existing) {
            // Update existing
            await supabase
                .from('website_content')
                .update({ value: editableContent[key] || '' })
                .eq('key', key);
        } else {
            // Insert new
            const field = allFields.find(f => f.key === key);
            await supabase
                .from('website_content')
                .insert({
                    key,
                    value: editableContent[key] || '',
                    section: field?.section || 'Other',
                    label: field?.label || key
                });
        }

        setSavingKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });

        setSavedKeys(prev => new Set(prev).add(key));

        // Clear saved indicator after 2 seconds
        setTimeout(() => {
            setSavedKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 2000);
    };

    const handleSaveAll = async () => {
        const fieldsToSave = filteredFields.map(f => f.key);
        for (const key of fieldsToSave) {
            await handleSave(key);
        }
    };

    // Filter fields based on active section and search
    const filteredFields = allFields.filter(f => {
        const matchesSection = f.section === activeSection;
        const matchesSearch = searchQuery === '' ||
            f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.placeholder.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSection && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2B705]"></div>
                    <p className="text-gray-500 font-medium">Loading Studio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] text-black font-['Inter']">
            {/* Sidebar / Navigation */}
            <nav className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 z-30 hidden lg:flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-[#F2B705] rounded-xl flex items-center justify-center shadow-lg shadow-[#F2B705]/20">
                            <span className="font-bold text-xl">L</span>
                        </div>
                        <div>
                            <span className="font-bold text-xl tracking-tight block">Brand Studio</span>
                            <span className="text-xs text-gray-400">Content Management</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search fields..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705]/50 focus:border-[#F2B705]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Pages</p>
                    <div className="space-y-1">
                        {sections.map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeSection === section
                                        ? 'bg-black text-white shadow-lg shadow-black/10'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{section}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeSection === section ? 'bg-white/20' : 'bg-gray-100'
                                        }`}>
                                        {allFields.filter(f => f.section === section).length}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#F2B705] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Live Site
                    </a>
                </div>
            </nav>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-30 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#F2B705] rounded-lg flex items-center justify-center">
                            <span className="font-bold">L</span>
                        </div>
                        <span className="font-bold">Studio</span>
                    </div>
                    <select
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-medium"
                        value={activeSection}
                        onChange={(e) => setActiveSection(e.target.value)}
                    >
                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <main className="lg:ml-72 p-6 lg:p-12 pt-20 lg:pt-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{activeSection}</h1>
                        <p className="text-gray-500">
                            {filteredFields.length} editable field{filteredFields.length !== 1 ? 's' : ''}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href="/"
                            target="_blank"
                            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                        </a>
                        <button
                            onClick={handleSaveAll}
                            className="px-5 py-2.5 bg-[#F2B705] text-black rounded-xl font-bold shadow-lg shadow-[#F2B705]/20 hover:scale-105 transition-all text-sm"
                        >
                            Save All Changes
                        </button>
                    </div>
                </header>

                <div className="max-w-4xl space-y-6">
                    {filteredFields.length > 0 ? (
                        filteredFields.map(field => (
                            <div
                                key={field.key}
                                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {field.label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {savedKeys.has(field.key) && (
                                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Saved
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handlePolish(field.key)}
                                            disabled={polishingKey === field.key}
                                            className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 hover:bg-[#F2B705]/10 text-gray-600 hover:text-[#D4A005] px-3 py-1.5 rounded-full transition-all border border-gray-100"
                                        >
                                            {polishingKey === field.key ? (
                                                <span className="animate-pulse">✨ Polishing...</span>
                                            ) : (
                                                <>✨ Polish</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-base focus:ring-2 focus:ring-[#F2B705] min-h-[100px] transition-all resize-none"
                                    value={editableContent[field.key] || ''}
                                    onChange={(e) => handleTextChange(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                />

                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-gray-400 font-mono">{field.key}</span>
                                    <button
                                        onClick={() => handleSave(field.key)}
                                        disabled={savingKeys.has(field.key)}
                                        className="text-sm font-bold text-[#F2B705] hover:text-[#D4A005] transition-colors px-3 py-1"
                                    >
                                        {savingKeys.has(field.key) ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="text-gray-400 font-medium">No fields found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-black">{allFields.length}</div>
                        <div className="text-xs text-gray-400 font-medium">Total Fields</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-black">{sections.length}</div>
                        <div className="text-xs text-gray-400 font-medium">Pages</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-black">{Object.keys(content).length}</div>
                        <div className="text-xs text-gray-400 font-medium">Synced to DB</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-green-600">Live</div>
                        <div className="text-xs text-gray-400 font-medium">Status</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Studio;
