// Build step: write static HTML for /blog and each published post so crawlers
// (Google, ChatGPT, Perplexity) get the real title, description and article text
// instead of the empty SPA shell. React replaces #root's contents on load.
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { blogPosts, type BlogPost } from '../lib/blogPosts';

// Change when the site moves to the root domain
export const SITE_URL = 'https://try.localsundigital.com';

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });

interface PageMeta {
    title: string;
    description: string;
    path: string;
    image?: string;
    type: 'website' | 'article';
    jsonLd?: object;
}

// Swap the shell's title/description for page-specific tags and fill #root
const renderPage = (shell: string, meta: PageMeta, body: string) => {
    const url = SITE_URL + meta.path;
    const head = [
        `<title>${escapeHtml(meta.title)}</title>`,
        `<meta name="description" content="${escapeHtml(meta.description)}" />`,
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:type" content="${meta.type}" />`,
        `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:site_name" content="Local Sun Digital" />`,
        meta.image ? `<meta property="og:image" content="${meta.image}" />` : '',
        `<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}" />`,
        meta.jsonLd
            ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`
            : '',
    ]
        .filter(Boolean)
        .join('\n  ');

    return shell
        .replace(/<title>[\s\S]*?<\/title>/, '')
        .replace(/<meta name="description"[^>]*>/, '')
        .replace('</head>', `  ${head}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
};

const siteNav = `<nav class="max-w-3xl mx-auto px-4 sm:px-6 pt-8 text-sm font-semibold text-charcoal/60"><a href="/">Local Sun Digital</a> / <a href="/blog">Blog</a></nav>`;

const renderPostBody = (post: BlogPost, html: string) => `${siteNav}
<main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
<article>
<p class="text-xs font-bold uppercase tracking-widest text-primary">${escapeHtml(post.pillar)}</p>
<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mt-3 mb-4">${escapeHtml(post.title)}</h1>
<p class="text-charcoal/50 mb-8"><time datetime="${post.date}">${formatDate(post.date)}</time> · Local Sun Digital</p>
${post.image ? `<img src="${post.image}" alt="" class="w-full aspect-[16/9] object-cover rounded-3xl mb-10" />` : ''}
<div class="blog-prose">${html}</div>
</article>
<p class="mt-12"><a href="/contact">Book a free strategy call</a></p>
</main>`;

const renderListBody = (posts: BlogPost[]) => `${siteNav}
<main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">The Local Sun Digital Blog</h1>
<p class="text-xl text-charcoal/60 mb-10">Plain-English guides to AI, automation, and growth systems for sales and marketing.</p>
${posts
    .map(
        (p) => `<article class="mb-10">
<h2 class="text-2xl font-bold mb-2"><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a></h2>
<p class="text-charcoal/60 mb-1">${escapeHtml(p.excerpt)}</p>
<p class="text-sm text-charcoal/40"><time datetime="${p.date}">${formatDate(p.date)}</time></p>
</article>`
    )
    .join('\n')}
</main>`;

const write = (outDir: string, rel: string, content: string) => {
    const file = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
};

export const prerenderBlog = (): Plugin => {
    let outDir = 'dist';
    let root = process.cwd();
    return {
        name: 'prerender-blog',
        apply: 'build',
        configResolved(config) {
            root = config.root;
            outDir = path.resolve(config.root, config.build.outDir);
        },
        closeBundle() {
            const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
            const today = todayIso();
            const published = blogPosts
                .filter((p) => p.date <= today)
                .sort((a, b) => (a.date < b.date ? 1 : -1));

            for (const post of blogPosts) {
                const rel = `blog/${post.slug}/index.html`;
                // Future posts get the plain shell; they're prerendered on the first deploy after their date
                if (post.date > today) {
                    write(outDir, rel, shell);
                    continue;
                }
                const html = fs.readFileSync(path.join(root, 'content/blog', `${post.slug}.html`), 'utf8');
                write(
                    outDir,
                    rel,
                    renderPage(
                        shell,
                        {
                            title: `${post.title} | Local Sun Digital`,
                            description: post.metaDescription,
                            path: `/blog/${post.slug}`,
                            image: post.image,
                            type: 'article',
                            jsonLd: {
                                '@context': 'https://schema.org',
                                '@type': 'BlogPosting',
                                headline: post.title,
                                description: post.metaDescription,
                                datePublished: post.date,
                                image: post.image,
                                mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
                                author: { '@type': 'Organization', name: 'Local Sun Digital', url: SITE_URL },
                                publisher: { '@type': 'Organization', name: 'Local Sun Digital', url: SITE_URL },
                            },
                        },
                        renderPostBody(post, html)
                    )
                );
            }

            write(
                outDir,
                'blog/index.html',
                renderPage(
                    shell,
                    {
                        title: 'Blog | Local Sun Digital',
                        description:
                            'Plain-English guides to AI, automation, and growth systems for sales and marketing, written for service business owners.',
                        path: '/blog',
                        type: 'website',
                    },
                    renderListBody(published)
                )
            );

            // Unknown URLs get the SPA (with its own not-found view) and a real 404 status
            write(outDir, '404.html', shell);

            const urls = [
                { loc: '/', lastmod: today },
                { loc: '/blog', lastmod: published[0]?.date ?? today },
                { loc: '/contact', lastmod: today },
                ...published.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.date })),
            ];
            write(
                outDir,
                'sitemap.xml',
                `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`
            );
            write(outDir, 'robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
        },
    };
};
