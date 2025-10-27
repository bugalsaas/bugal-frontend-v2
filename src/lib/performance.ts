/**
 * Performance Utilities
 * Helper functions for performance monitoring and optimization
 */

// Track page load performance
export function trackPageLoad() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      const requestTime = perfData.responseEnd - perfData.requestStart;
      
      console.log('Page Load Performance:', {
        pageLoadTime: `${pageLoadTime}ms`,
        domReadyTime: `${domReadyTime}ms`,
        requestTime: `${requestTime}ms`,
      });
    }
  });
}

// Measure component render time
export function measureComponentRender(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return () => {};
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  };
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for low memory devices
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    return memory < 4; // Less than 4GB RAM
  }
  
  // Check for slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  }
  
  return false;
}

// Optimize images loading
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

