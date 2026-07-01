import { useEffect } from 'react';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needsImprovement' | 'poor';
}

export function useWebVitals() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      return;
    }

    // LCP - Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const metric: Metric = {
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: lastEntry.renderTime || lastEntry.loadTime < 2500 ? 'good' : 'needsImprovement'
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('LCP:', metric);
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          const metric: Metric = {
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : 'needsImprovement'
          };
          if (process.env.NODE_ENV === 'development') {
            console.log('CLS:', metric);
          }
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // FID - First Input Delay (deprecated, but still useful)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const entry = entries[0];
        const metric: Metric = {
          name: 'FID',
          value: (entry as any).processingDuration,
          rating: (entry as any).processingDuration < 100 ? 'good' : 'needsImprovement'
        };
        if (process.env.NODE_ENV === 'development') {
          console.log('FID:', metric);
        }
      }
    });
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // First Input Delay is deprecated
    }

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
      try {
        fidObserver.disconnect();
      } catch (e) {
        // Already disconnected
      }
    };
  }, []);
}
