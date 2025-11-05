import React from 'react';

/**
 * Bundle optimization utilities and dynamic imports
 */

// Lazy load heavy libraries only when needed
export const loadChartJS = async () => {
  try {
    const chartModule = await import('recharts');
    return chartModule;
  } catch (error) {
    console.warn('Chart library not available');
    return null;
  }
};

export const loadDateFns = async () => {
  const [
    { formatDistanceToNow },
    { format },
    { startOfWeek },
    { endOfWeek }
  ] = await Promise.all([
    import('date-fns/formatDistanceToNow'),
    import('date-fns/format'),
    import('date-fns/startOfWeek'),
    import('date-fns/endOfWeek')
  ]);
  
  return {
    formatDistanceToNow,
    format,
    startOfWeek,
    endOfWeek
  };
};

export const loadReactWindow = async () => {
  try {
    const reactWindow = await import('react-window');
    return reactWindow;
  } catch (error) {
    console.warn('React Window not available');
    return null;
  }
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload commonly used components
  const criticalImports = [
    () => import('@/components/ui/button'),
    () => import('@/components/ui/card'),
    () => import('@/components/ui/input'),
    () => import('@/hooks/useAuth')
  ];

  // Start preloading in idle time
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      criticalImports.forEach(importFn => importFn());
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      criticalImports.forEach(importFn => importFn());
    }, 1000);
  }
};

// Resource hints for better loading
export const addResourceHints = () => {
  const head = document.head;
  
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    head.appendChild(link);
  });
  
  // DNS prefetch for Supabase
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = '//supabase.co';
  head.appendChild(dnsPrefetch);
};

// Code splitting helper
export const createAsyncComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return React.lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Failed to load component:', error);
      return { 
        default: fallback || (() => React.createElement('div', null, 'Failed to load component'))
      };
    }
  });
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Bundle Analysis');
    
    // Estimate component sizes
    const estimateComponentSize = (componentName: string, estimatedSize: number) => {
      console.log(`${componentName}: ~${estimatedSize}KB`);
    };
    
    estimateComponentSize('React Window', 15);
    estimateComponentSize('Date-fns', 20);
    estimateComponentSize('Lucide React', 10);
    estimateComponentSize('Recharts', 50);
    
    console.groupEnd();
  }
};

// Initialize optimizations
export const initializeBundleOptimizations = () => {
  // Add resource hints
  addResourceHints();
  
  // Preload critical components
  preloadCriticalComponents();
  
  // Development bundle analysis
  if (process.env.NODE_ENV === 'development') {
    analyzeBundleSize();
  }
};

export default {
  loadChartJS,
  loadDateFns,
  loadReactWindow,
  preloadCriticalComponents,
  addResourceHints,
  createAsyncComponent,
  initializeBundleOptimizations
};