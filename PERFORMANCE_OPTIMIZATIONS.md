# Performance Optimizations Guide

This document outlines all the performance optimizations implemented to improve Core Web Vitals scores and overall site speed.

## Implemented Optimizations

### 1. **Lazy Loading of Images** ✅
- **File**: `src/components/LazyImage.tsx`
- **Implementation**: Custom `LazyImage` component using Intersection Observer API
- **Benefits**:
  - Images below the fold are only loaded when they enter the viewport
  - Reduces initial page load time
  - Saves bandwidth for users who don't scroll
- **Usage**:
  ```tsx
  import LazyImage from "@/components/LazyImage";
  
  <LazyImage 
    src="image.jpg" 
    alt="Description"
    width={400}
    height={300}
  />
  ```

### 2. **Code Splitting & Bundle Optimization** ✅
- **File**: `vite.config.ts`
- **Changes**:
  - Split major dependencies into separate chunks (React, Router, Motion, Query, Icons, UI)
  - CSS code splitting enabled
  - Terser minification enabled with console removal
  - Source maps disabled in production
- **Benefits**:
  - Smaller initial JS bundle
  - Parallel download of chunks
  - Faster page load

### 3. **Font Optimization** ✅
- **File**: `index.html`
- **Changes**:
  - Added `font-display: swap` to Google Fonts
  - Preload critical fonts (Inter, Space Grotesk)
  - DNS prefetch for font CDN
- **Benefits**:
  - Shows fallback font immediately
  - Better Largest Contentful Paint (LCP) score
  - Prevents layout shift from font loading

### 4. **Cumulative Layout Shift (CLS) Prevention** ✅
- **File**: `src/index.css`
- **Changes**:
  - Fixed dimensions for images
  - Min-height for dynamic content
  - Aspect ratio containers
  - Min-height for buttons/touch targets
- **Benefits**:
  - Prevents page jank
  - Better user experience
  - Improved Core Web Vitals score

### 5. **Resource Preconnection & Prefetch** ✅
- **File**: `index.html`
- **Changes**:
  - Preconnect to Google Fonts, Cloudinary
  - DNS prefetch for external APIs (Cal.com, ElevenLabs)
  - Prefetch for secondary pages (About, Demo)
- **Benefits**:
  - Faster DNS resolution
  - Earlier connection establishment
  - Reduced latency for external resources

### 6. **Core Web Vitals Monitoring** ✅
- **File**: `src/hooks/useWebVitals.ts`
- **Implementation**: Custom hook to track:
  - LCP (Largest Contentful Paint)
  - CLS (Cumulative Layout Shift)
  - FID (First Input Delay)
- **Benefits**:
  - Real-time monitoring in development
  - Early detection of performance issues
  - Usage**: Add to your app root:
  ```tsx
  import { useWebVitals } from "@/hooks/useWebVitals";
  
  function App() {
    useWebVitals();
    return <YourApp />;
  }
  ```

### 7. **Navbar Logo Optimization** ✅
- **File**: `src/components/Navbar.tsx`
- **Changes**:
  - Added `loading="eager"` for logo (critical above fold)
  - Added `decoding="async"` for non-blocking decoding
  - Set explicit width/height to prevent layout shift
- **Benefits**:
  - Faster logo display
  - Prevents CLS from logo loading
  - Optimized for LCP

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | Monitor with useWebVitals |
| FID | < 100ms | Monitor with useWebVitals |
| CLS | < 0.1 | Monitor with useWebVitals |
| First Contentful Paint | < 1.8s | Monitor in PageSpeed |
| Total Blocking Time | < 300ms | Monitor in PageSpeed |

## Testing & Validation

### Run Performance Analysis
```bash
# Build for production
npm run build

# Test with PageSpeed Insights
# Visit: https://pagespeed.web.dev/?url=https://voxmation.com

# Test locally with Lighthouse
# In Chrome DevTools -> Lighthouse -> Generate Report
```

### Best Practices Going Forward

1. **Always use LazyImage for below-fold images**
   ```tsx
   // ✅ Good
   <LazyImage src="..." alt="..." />
   
   // ❌ Avoid
   <img src="..." alt="..." /> (for below-fold images)
   ```

2. **Specify image dimensions**
   ```tsx
   // ✅ Good
   <LazyImage src="..." width={400} height={300} />
   
   // ❌ Avoid
   <LazyImage src="..." /> (missing dimensions)
   ```

3. **Monitor Core Web Vitals regularly**
   - Check PageSpeed Insights monthly
   - Use Chrome DevTools Lighthouse
   - Monitor production metrics with Sentry

4. **Avoid inline styles that cause layout shift**
   ```tsx
   // ✅ Good
   <div className="h-12 w-auto"> {/* Fixed dimensions */}
   
   // ❌ Avoid
   <div style={{ height: dynamicHeight }}> {/* Variable height */}
   ```

5. **Lazy load secondary routes**
   - Already implemented in App.tsx
   - Secondary pages are code-split automatically

## Bundle Size Analysis

Check bundle sizes with:
```bash
npm run build
# Check dist/ folder size

# For detailed analysis:
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts and rebuild
```

## Monitoring in Production

1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **Chrome DevTools Lighthouse**
3. **Web Vitals from real users** (via Sentry/Analytics)

## Additional Resources

- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Image Optimization](https://web.dev/optimize-images/)
- [Font Loading Strategy](https://web.dev/optimize-web-fonts/)
- [CLS Prevention](https://web.dev/optimize-cls/)
