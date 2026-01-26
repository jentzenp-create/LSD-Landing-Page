---
description: Performance optimization techniques for fast mobile page load times (90+ Lighthouse score)
---

# Web Performance Optimization Checklist

Apply these techniques from the start to achieve 90+ Lighthouse mobile performance scores.

## 1. Tailwind CSS - Use Build-Time Compilation (NOT CDN)

**Never use the Tailwind CDN** (`https://cdn.tailwindcss.com`) - it's 300KB+ of runtime JavaScript.

### Setup:
```bash
npm install -D tailwindcss @tailwindcss/vite
```

### vite.config.ts:
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ... rest of config
});
```

### index.css (entry point):
```css
@import "tailwindcss";

@theme {
  --color-primary: #YOUR_COLOR;
  /* custom theme variables */
}
```

### index.tsx:
```typescript
import './index.css';
```

---

## 2. Self-Host Fonts (Don't Use Google Fonts CDN)

Google Fonts adds ~200-500ms to FCP due to external network requests.

### Install font package:
```bash
npm install @fontsource/inter
```

### Import in CSS (Latin subset only for English sites):
```css
@import "@fontsource/inter/latin-400.css";
@import "@fontsource/inter/latin-500.css";
@import "@fontsource/inter/latin-600.css";
@import "@fontsource/inter/latin-700.css";
```

**Important:** Only import the subsets you need (latin, latin-ext, cyrillic, etc.)

---

## 3. Lazy Load Third-Party Scripts

Never load Stripe, analytics, or other third-party scripts synchronously.

### index.html pattern:
```html
<script>
  var stripeLoaded = false;
  function loadStripe() {
    if (stripeLoaded) return;
    stripeLoaded = true;
    var s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.async = true;
    document.head.appendChild(s);
  }
  
  // Load after 3 seconds OR on user interaction
  setTimeout(loadStripe, 3000);
  ['click', 'scroll', 'touchstart'].forEach(function(e) {
    document.addEventListener(e, loadStripe, { once: true, passive: true });
  });
</script>
```

---

## 4. React Code Splitting with React.lazy()

Split routes into separate chunks to reduce initial bundle size.

### index.tsx:
```typescript
import React, { Suspense, lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  }}>
    <div className="spinner" />
  </div>
);

// Wrap routes in Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes>
</Suspense>
```

---

## 5. Critical Inline CSS in index.html

Add minimal CSS directly in `<head>` for instant first paint with a loading state.

```html
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #fff;
    margin: 0;
  }
  
  /* Loading spinner while React loads */
  #root:empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  #root:empty::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid #YOUR_PRIMARY_COLOR;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
```

---

## 6. Safari-Optimized Vite Build Config

Safari is slower with ES modules. Add these build optimizations:

### vite.config.ts:
```typescript
export default defineConfig({
  // ... other config
  build: {
    // Target Safari 14+
    target: ['es2020', 'safari14'],
    
    // Polyfill modulePreload for Safari
    modulePreload: {
      polyfill: true
    },
    
    // Optimize chunks - Safari is slow with many modules
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
```

---

## 7. Clean index.html Template

Minimal, performance-optimized HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Site Title</title>
  
  <!-- DNS prefetch for lazy-loaded resources -->
  <link rel="dns-prefetch" href="https://js.stripe.com">
  
  <!-- Critical inline CSS here -->
  <style>/* ... */</style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
  <!-- Lazy-loaded scripts here -->
</body>
</html>
```

---

## Quick Reference: What NOT To Do

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| `<script src="https://cdn.tailwindcss.com">` | Install `@tailwindcss/vite` |
| `<link href="fonts.googleapis.com/...">` | Install `@fontsource/your-font` |
| `<script src="https://js.stripe.com/v3/">` | Lazy load on interaction |
| Static `import Page from './Page'` | `lazy(() => import('./Page'))` |
| All fonts/subsets | Latin-only subset |

---

## Expected Results

Following these techniques should achieve:

| Metric | Target |
|--------|--------|
| Performance Score | 90+ |
| First Contentful Paint | < 2.0s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 50ms |
| Cumulative Layout Shift | < 0.1 |
