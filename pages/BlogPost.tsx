
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ServicesHeader from '../components/services/ServicesHeader';
import ServicesFooter from '../components/services/ServicesFooter';
import { getPostBySlug, getRelatedPosts } from '../lib/blogPosts';
import { loadPostContent } from '../lib/blogContent';

const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = slug ? getPostBySlug(slug) : undefined;
    const [html, setHtml] = useState<string | null>(null);

    useEffect(() => {
        if (!post) return;
        document.title = `${post.title} | Local Sun Digital`;
        let active = true;
        setHtml(null);
        loadPostContent(post.slug).then((content) => {
            if (active) setHtml(content ?? '');
        });
        return () => {
            active = false;
        };
    }, [post]);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const related = getRelatedPosts(post.slug);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader />
            <main>
                <article className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-white to-offWhite">
                    <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="mb-8">
                            <Link
                                to="/blog"
                                className="inline-flex items-center gap-2 text-charcoal/60 hover:text-primary transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Back to Blog
                            </Link>
                        </div>

                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">
                            {post.pillar}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-black leading-tight">
                            {post.title}
                        </h1>
                        <p className="text-charcoal/40 font-semibold mb-10">{formatDate(post.date)}</p>

                        {post.image && (
                            <img
                                src={post.image}
                                alt=""
                                className="w-full aspect-[16/9] object-cover rounded-3xl mb-10 shadow-xl shadow-black/10"
                            />
                        )}

                        {html === null ? (
                            <div className="space-y-4 animate-pulse" aria-label="Loading article">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="h-4 bg-black/5 rounded w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
                        )}

                        {/* Inline CTA */}
                        <div className="mt-14 bg-black rounded-3xl p-8 sm:p-10 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                                Want this running in your business?
                            </h2>
                            <p className="text-white/60 mb-6 max-w-xl mx-auto">
                                We'll show you exactly where automation can save your team time. No pressure, no tech jargon.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 bg-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all"
                            >
                                Get a Free Automation Audit
                            </Link>
                        </div>
                    </div>
                </article>

                {related.length > 0 && (
                    <section className="pb-20 sm:pb-24">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal/40 mb-6">
                                Keep Reading
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {related.map((p) => (
                                    <Link
                                        key={p.slug}
                                        to={`/blog/${p.slug}`}
                                        className="group block bg-white border-2 border-black/5 rounded-2xl p-6 hover:border-primary/60 transition-all"
                                    >
                                        <h4 className="font-bold text-black group-hover:text-primary transition-colors mb-2">
                                            {p.title}
                                        </h4>
                                        <p className="text-sm text-charcoal/50">{p.excerpt}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <ServicesFooter />
        </div>
    );
};

export default BlogPost;
