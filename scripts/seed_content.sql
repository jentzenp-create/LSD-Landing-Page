-- Add all content fields for the Brand Studio
-- Run this in your Supabase SQL Editor

INSERT INTO website_content (key, value, section, label) VALUES
-- Services Overview Page - Hero
('services_hero_badge', 'Full-Service Digital Agency', 'Services Overview', 'Badge Text'),
('services_hero_title', 'All Your Digital Growth Services in One Place', 'Services Overview', 'Main Headline'),
('services_hero_subtitle', 'From review automation to web design, lead generation to SEO—explore our complete suite of services with transparent pricing and no hidden fees.', 'Services Overview', 'Sub-headline'),
('services_hero_cta_primary', 'Explore Services', 'Services Overview', 'Primary Button'),
('services_hero_cta_secondary', 'Get Custom Quote', 'Services Overview', 'Secondary Button'),

-- Services Overview - Section Headings
('services_grid_title', 'Our Services', 'Services Overview', 'Services Section Title'),
('services_grid_subtitle', 'Explore our full suite of digital growth solutions. Click any service to see detailed pricing and features.', 'Services Overview', 'Services Section Subtitle'),
('services_cta_title', 'Not Sure Where to Start?', 'Services Overview', 'Bottom CTA Title'),
('services_cta_subtitle', 'Book a free consultation and we''ll help you find the perfect solution for your business.', 'Services Overview', 'Bottom CTA Subtitle'),
('services_cta_button', 'Get Free Consultation', 'Services Overview', 'Bottom CTA Button'),

-- Service Detail Pages
('detail_stats_clients', '50+', 'Service Details', 'Stats - Happy Clients'),
('detail_stats_rating', '4.9★', 'Service Details', 'Stats - Average Rating'),
('detail_stats_growth', '2x', 'Service Details', 'Stats - Growth Rate'),
('detail_testimonial', 'Working with Local Sun Digital transformed our business. Their service delivered results beyond our expectations.', 'Service Details', 'Testimonial Quote'),
('detail_testimonial_author', 'Satisfied Client', 'Service Details', 'Testimonial Author'),
('detail_testimonial_role', 'Local Business Owner', 'Service Details', 'Testimonial Role'),
('detail_pricing_title', 'Choose Your Plan', 'Service Details', 'Pricing Section Title'),
('detail_pricing_subtitle', 'Transparent pricing with no hidden fees. Cancel anytime.', 'Service Details', 'Pricing Section Subtitle'),
('detail_cta_title', 'Ready to Get Started?', 'Service Details', 'Bottom CTA Title'),
('detail_cta_subtitle', 'Book a free consultation and let''s discuss how we can help grow your business.', 'Service Details', 'Bottom CTA Subtitle'),
('detail_cta_button', 'Book Free Consultation', 'Service Details', 'Bottom CTA Button'),

-- Footer / Global
('footer_tagline', 'Helping local businesses thrive in the digital age.', 'Global', 'Footer Tagline'),
('footer_copyright', '© 2026 Local Sun Digital. All rights reserved.', 'Global', 'Copyright Text'),
('company_phone', '(555) 123-4567', 'Global', 'Phone Number'),
('company_email', 'hello@localsundigital.com', 'Global', 'Email Address')

ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
