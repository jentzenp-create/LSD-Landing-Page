// Article bodies live as HTML files in content/blog/<slug>.html (pasted from Wordform).
// Loaded on demand so the homepage bundle doesn't carry every article.
const articleFiles = import.meta.glob<string>('../content/blog/*.html', {
    query: '?raw',
    import: 'default',
});

export const loadPostContent = async (slug: string): Promise<string | null> => {
    const loader = articleFiles[`../content/blog/${slug}.html`];
    return loader ? loader() : null;
};
