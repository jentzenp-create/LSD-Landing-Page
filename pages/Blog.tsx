
import React from 'react';
import { Link } from 'react-router-dom';
import ServicesHeader from '../components/services/ServicesHeader';
import ServicesFooter from '../components/services/ServicesFooter';
import { getPublishedPosts } from '../lib/blogPosts';
import { Reveal, trackSpotlight } from '../components/services/Motion';

const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

const Blog: React.FC = () => {
    const sorted = getPublishedPosts();

    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader />
            <main>
                {/* Hero */}
                <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-white to-offWhite">
                    <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
                    <div className="blob w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] bg-primary/20 top-[10%] left-[15%]" />
                    <div className="blob w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] bg-orange-400/15 bottom-0 right-[12%]" style={{ animationDelay: '-8s' }} />
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">
                            AI &amp; Automation Insights
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-black">
                            The Local Sun Digital <span className="text-gradient-sun">Blog</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
                            Plain-English guides to AI, automation, and growth systems for sales and marketing.
                        </p>
                    </div>
                </section>

                {/* Post grid */}
                <section className="py-12 sm:py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        {sorted.length === 0 ? (
                            <p className="text-center text-charcoal/50 text-lg">New posts coming soon.</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                                {sorted.map((post, i) => (
                                    <Reveal key={post.slug} delay={(i % 2) * 0.1} className="h-full">
                                    <Link
                                        to={`/blog/${post.slug}`}
                                        onMouseMove={trackSpotlight}
                                        className="spotlight-card group block h-full bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {post.image && (
                                            <div className="-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 overflow-hidden rounded-t-3xl aspect-[16/9]">
                                                <img
                                                    src={post.image}
                                                    alt=""
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <span className="inline-block text-xs font-bold uppercase tracking-wide text-primary mb-3">
                                            {post.pillar}
                                        </span>
                                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-black group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-charcoal/60 mb-4 leading-relaxed">{post.excerpt}</p>
                                        <span className="text-sm font-semibold text-charcoal/40">
                                            {formatDate(post.date)}
                                        </span>
                                    </Link>
                                    </Reveal>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <ServicesFooter />
        </div>
    );
};

export default Blog;
