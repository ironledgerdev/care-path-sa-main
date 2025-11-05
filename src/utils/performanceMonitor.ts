import React from 'react';

/**
 * Performance monitoring utilities for React components
 */

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  propsCount: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  /**
   * Measure component render performance
   */
  measureRender = (componentName: string, renderFn: () => any, propsCount = 0) => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();

    this.addMetric({
      renderTime: end - start,
      componentName,
      propsCount,
      timestamp: Date.now()
    });

    return result;
  };

  /**
   * Add performance metric
   */
  private addMetric = (metric: PerformanceMetrics) => {
    this.metrics.push(metric);
    
    // Keep only recent metrics to avoid memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2);
    }
  };

  /**
   * Get performance stats for a component
   */
  getComponentStats = (componentName: string) => {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    
    if (componentMetrics.length === 0) {
      return null;
    }

    const renderTimes = componentMetrics.map(m => m.renderTime);
    const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    return {
      componentName,
      totalRenders: componentMetrics.length,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      maxRenderTime: Math.round(maxRenderTime * 100) / 100,
      minRenderTime: Math.round(minRenderTime * 100) / 100,
      recentRenders: componentMetrics.slice(-10)
    };
  };

  /**
   * Get all performance stats
   */
  getAllStats = () => {
    const componentNames = [...new Set(this.metrics.map(m => m.componentName))];
    return componentNames.map(name => this.getComponentStats(name)).filter(Boolean);
  };

  /**
   * Clear all metrics
   */
  clear = () => {
    this.metrics = [];
  };

  /**
   * Log slow renders (> threshold ms)
   */
  logSlowRenders = (threshold = 16) => {
    const slowRenders = this.metrics.filter(m => m.renderTime > threshold);
    
    if (slowRenders.length > 0) {
      console.group('🐌 Slow Renders Detected');
      slowRenders.forEach(metric => {
        console.warn(`${metric.componentName}: ${metric.renderTime.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  };
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component performance
export const usePerformanceMonitor = (componentName: string) => {
  return {
    measureRender: (renderFn: () => any, propsCount?: number) => 
      performanceMonitor.measureRender(componentName, renderFn, propsCount),
    getStats: () => performanceMonitor.getComponentStats(componentName)
  };
};

// HOC for automatic performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name;
    const propsCount = Object.keys(props || {}).length;
    
    return performanceMonitor.measureRender(
      name,
      () => React.createElement(Component, props),
      propsCount
    );
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Development-only performance logging
if (process.env.NODE_ENV === 'development') {
  // Log slow renders every 30 seconds
  setInterval(() => {
    performanceMonitor.logSlowRenders(16);
  }, 30000);

  // Log performance stats on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const stats = performanceMonitor.getAllStats();
      if (stats.length > 0) {
        console.group('📊 Component Performance Stats');
        stats.forEach(stat => {
          console.log(`${stat?.componentName}: Avg ${stat?.avgRenderTime}ms (${stat?.totalRenders} renders)`);
        });
        console.groupEnd();
      }
    }
  });
}

export default PerformanceMonitor;
