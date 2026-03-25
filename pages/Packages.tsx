
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServicesFooter from '../components/services/ServicesFooter';

const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/cj4hQsqqI9fhy6MABW7y/webhook-trigger/3c0a6347-bd55-45e7-882e-d9aa39c54b23';

const PACKAGES = {
  conversion: {
    name: 'Conversion Engine™',
    stripeLink: 'https://buy.stripe.com/14A4gz18E6XIfXk4Ew0kE0h',
  },
  pipeline: {
    name: 'AI Pipeline System™',
    stripeLink: 'https://buy.stripe.com/3cI00j8B6bdY3aygne0kE0j',
  },
  bundle: {
    name: 'Full Growth System',
    stripeLink: 'https://buy.stripe.com/8x27sL18EbdYcL85IA0kE0k',
  },
} as const;

type PackageKey = keyof typeof PACKAGES;

const SunLogo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="fill-primary">
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
);

const CheckIcon: React.FC = () => (
  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const PackagesPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', businessName: '', phone: '', email: '' });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPackage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedPackage]);

  const openCheckout = (pkg: PackageKey) => {
    setFormData({ name: '', businessName: '', phone: '', email: '' });
    setSelectedPackage(pkg);
  };

  const closeCheckout = () => {
    if (!isLoading) setSelectedPackage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setIsLoading(true);

    const pkg = PACKAGES[selectedPackage];

    try {
      await fetch(GHL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, package: pkg.name, source: 'Packages Page' }),
      });
      const prefilledEmail = encodeURIComponent(formData.email);
      window.location.href = `${pkg.stripeLink}?prefilled_email=${prefilledEmail}`;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">

      {/* ── CHECKOUT MODAL ── */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCheckout} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 md:p-10">
            {/* Close */}
            <button
              onClick={closeCheckout}
              disabled={isLoading}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-8">
              <span className="inline-flex items-center bg-primary/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-4">
                {PACKAGES[selectedPackage].name}
              </span>
              <h2 className="text-3xl font-bold text-black">Complete Your Order</h2>
              <p className="text-charcoal/50 font-medium mt-2">Enter your details and you'll be taken to secure checkout.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider">Name</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-offWhite border border-black/5 rounded-xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider">Business Name</label>
                  <input
                    required
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Acme Advisors"
                    className="w-full bg-offWhite border border-black/5 rounded-xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider">Phone</label>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full bg-offWhite border border-black/5 rounded-xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider">Email</label>
                  <input
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-offWhite border border-black/5 rounded-xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-bold py-4 rounded-full text-lg hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Redirecting...' : 'Continue to Secure Checkout'}
              </button>

              <p className="text-center text-charcoal/40 text-xs font-bold uppercase tracking-wider pt-1">
                Secured by Stripe. No surprises.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <SunLogo />
            <span className="font-bold text-xl tracking-tight hidden sm:block uppercase text-black">
              Local Sun <span className="text-primary">Digital</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#packages" className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors">Packages</a>
            <a href="#how-it-works" className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors">How It Works</a>
            <Link to="/" className="text-sm font-semibold text-charcoal/70 hover:text-black transition-colors">All Services</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10"
            >
              Book a Call
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen
                  ? <path d="M6 18L18 6M6 6l12 12" />
                  : <path d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute top-20 left-0 right-0 bg-white shadow-2xl rounded-b-3xl p-6 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="space-y-2">
            <a href="#packages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-lg font-semibold text-charcoal hover:bg-primary/10 transition-colors">Packages</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-lg font-semibold text-charcoal hover:bg-primary/10 transition-colors">How It Works</a>
            <Link to="/" className="block px-4 py-3 rounded-xl text-lg font-semibold text-charcoal hover:bg-primary/10 transition-colors">All Services</Link>
          </div>
        </div>
      </div>

      <main>

        {/* ── 1. HERO ── */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white min-h-[90vh] flex items-center">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Text */}
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-charcoal">For Professional Service Businesses</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-black">
                  Never Miss Another Opportunity: Turn Your Marketing and Sales Into a System
                </h1>
                <p className="text-lg md:text-xl text-charcoal/60 mb-10 leading-relaxed font-medium max-w-xl">
                  We help professional service businesses clearly communicate their value and automatically follow up with every lead, so more conversations turn into clients.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <a
                    href="#packages"
                    className="bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10 active:scale-95 text-center"
                  >
                    View Packages
                  </a>
                  <a
                    href="#how-it-works"
                    className="bg-white text-black border-2 border-black/10 px-10 py-5 rounded-full font-bold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    See How It Works
                  </a>
                </div>
              </div>

              {/* Right: Explainer Video */}
              <div className="relative mt-8 lg:mt-0">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-black/5">
                  <video
                    src="/explainer-video.mp4"
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full block"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. PROBLEM SECTION ── */}
        <section className="py-24 bg-offWhite">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black">Is this for you?</h2>
              <p className="text-charcoal/50 font-medium mt-3 text-lg">See if it's a fit before you reach out.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IS for you */}
              <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <h3 className="text-xl font-bold text-black">This IS for you</h3>
                </div>
                <div className="space-y-0">
                  {[
                    "People don't fully understand your value right away",
                    "You rely on conversations to explain everything",
                    "Leads come in, but follow-up is inconsistent",
                    "Opportunities slip through the cracks",
                    "Your sales process feels manual or scattered",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-4 border-b border-black/5 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-base font-medium text-charcoal/70">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ISN'T for you */}
              <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <h3 className="text-xl font-bold text-black">This ISN'T for you</h3>
                </div>
                <div className="space-y-0">
                  {[
                    "You're looking for overnight results",
                    "You don't have a proven product or service yet",
                    "You're not ready to invest in building systems",
                    "You prefer to manage everything manually",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-4 border-b border-black/5 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-base font-medium text-charcoal/70">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 text-center">
              <p className="text-2xl md:text-3xl font-bold text-black">
                It's not a lead problem. It's a system problem.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. TRANSFORMATION SECTION ── */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black">What if everything just worked?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { text: 'Your value is clear in seconds', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { text: 'Your marketing does the explaining for you', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
                { text: 'Every lead is tracked and followed up with', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                { text: 'You always know what to do next', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 bg-offWhite border border-black/5 rounded-2xl p-7 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-black">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. SOLUTION OVERVIEW ── */}
        <section className="py-24 bg-offWhite">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black">Two Systems That Fix This</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-black/5 rounded-3xl p-10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Conversion Engine™</h3>
                <p className="text-charcoal/60 text-lg leading-relaxed font-medium">
                  Turns your expertise into a clear, compelling experience that converts visitors into interested prospects before you ever get on a call.
                </p>
              </div>

              <div className="bg-white border border-black/5 rounded-3xl p-10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">AI Pipeline System™</h3>
                <p className="text-charcoal/60 text-lg leading-relaxed font-medium">
                  Organizes your leads and automates follow-up so nothing falls through the cracks. Ever. Your pipeline stays alive without you having to babysit it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. PACKAGES ── */}
        <section id="packages" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">Choose Your System</h2>
              <p className="text-charcoal/50 text-xl font-medium max-w-2xl mx-auto">
                Pick the system that fits where you are, or get both and build the complete growth stack.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">

              {/* Card 1: Conversion Engine */}
              <div className="bg-white border border-black/8 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all">
                <div className="mb-8">
                  <span className="inline-flex items-center bg-black/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-5">
                    One-Time
                  </span>
                  <h3 className="text-2xl font-bold text-black mb-4">Conversion Engine™</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-black text-black">$2,000</span>
                  </div>
                  <p className="text-charcoal/40 font-semibold text-sm">One-time investment</p>
                </div>

                <div className="space-y-4 mb-8">
                  {['High-Converting Landing Page', '60-Second Explainer Video', 'Proposal Enhancement Kit'].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="text-charcoal/70 font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-offWhite rounded-2xl p-5 mb-8 border border-black/5">
                  <p className="text-sm font-semibold text-charcoal/60 leading-relaxed italic">
                    "When someone sees your business, they get it instantly and take action."
                  </p>
                </div>

                <button
                  onClick={() => openCheckout('conversion')}
                  className="block w-full bg-black text-white font-bold py-4 rounded-full text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  Get Started
                </button>
              </div>

              {/* Card 2: Bundle (Most Popular - center, emphasized) */}
              <div className="relative lg:-mt-6">
                <div className="p-[2px] bg-gradient-to-br from-primary via-primary/60 to-primary/20 rounded-[32px] shadow-2xl shadow-primary/20">
                  <div className="bg-white rounded-[30px] p-8 md:p-10 relative">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-primary text-black px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide shadow-lg">
                        Most Popular
                      </div>
                    </div>

                    <div className="mb-8 pt-3">
                      <span className="inline-flex items-center bg-primary/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-5">
                        Best Value
                      </span>
                      <h3 className="text-2xl font-bold text-black mb-2">Full Growth System</h3>
                      <p className="text-charcoal/50 font-medium mb-5">Attract &#8594; Convert &#8594; Close with both systems working together</p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-5xl font-black text-black">$3,000</span>
                      </div>
                      <p className="text-charcoal/40 font-semibold text-sm">one-time + $300/month</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {[
                        'High-Converting Landing Page',
                        '60-Second Explainer Video',
                        'Proposal Enhancement Kit',
                        'Visual Sales Pipeline',
                        'Automated Follow-Up (email + SMS)',
                        'AI Personal Assistant',
                        'AI-Assisted Outreach',
                      ].map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                            <CheckIcon />
                          </div>
                          <span className="text-charcoal/70 font-semibold">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => openCheckout('bundle')}
                      className="block w-full bg-black text-white font-bold py-5 rounded-full text-center text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-primary/20"
                    >
                      Get Full System
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: AI Pipeline System */}
              <div className="bg-white border border-black/8 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all">
                <div className="mb-8">
                  <span className="inline-flex items-center bg-black/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-5">
                    Setup + Monthly
                  </span>
                  <h3 className="text-2xl font-bold text-black mb-4">AI Pipeline System™</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-black text-black">$2,000</span>
                  </div>
                  <p className="text-charcoal/40 font-semibold text-sm">setup + $300/month</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    'Visual Sales Pipeline',
                    'Automated Follow-Up (email + SMS)',
                    'AI Personal Assistant',
                    'AI-Assisted Outreach',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="text-charcoal/70 font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-offWhite rounded-2xl p-5 mb-8 border border-black/5">
                  <p className="text-sm font-semibold text-charcoal/60 leading-relaxed italic">
                    "Your pipeline stays active, organized, and moving without constant manual effort."
                  </p>
                </div>

                <button
                  onClick={() => openCheckout('pipeline')}
                  className="block w-full bg-black text-white font-bold py-4 rounded-full text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  Get Started
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ── 6. HOW IT WORKS ── */}
        <section id="how-it-works" className="py-24 bg-offWhite">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-black">How It Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-14 left-[calc(12.5%+14px)] right-[calc(12.5%+14px)] h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

              {[
                {
                  step: '1',
                  title: 'Onboard',
                  description: 'A call to understand your brand and value proposition so every asset is built to resonate.',
                  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                },
                {
                  step: '2',
                  title: 'Build',
                  description: 'We create your systems and assets: landing page, video, pipeline, and automations.',
                  icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
                },
                {
                  step: '3',
                  title: 'Launch',
                  description: 'Everything goes live and starts working. Your leads enter a system that never sleeps.',
                  icon: 'M5 3l14 9-14 9V3z',
                },
                {
                  step: '4',
                  title: 'Grow',
                  description: 'You get better conversations and more closed deals. The system does the heavy lifting.',
                  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-white border border-black/5 rounded-3xl flex items-center justify-center shadow-xl">
                      <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-black text-black">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">{item.title}</h3>
                  <p className="text-charcoal/60 font-medium leading-relaxed max-w-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. FINAL CTA ── */}
        <section className="py-24 bg-black relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              You don't need more leads. You need a system that converts them.
            </h2>
            <p className="text-white/60 text-xl font-medium mb-12 max-w-2xl mx-auto">
              Take the next step and see which system is right for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#packages"
                className="bg-primary text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-primary/30 active:scale-95 w-full sm:w-auto text-center"
              >
                View Packages
              </a>
              <Link
                to="/contact"
                className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all w-full sm:w-auto text-center"
              >
                Book a Call
              </Link>
            </div>
          </div>
        </section>

      </main>

      <ServicesFooter />
    </div>
  );
};

export default PackagesPage;
