import React, { lazy } from 'react';

// Performance optimized page components with proper code splitting
export const OptimizedDoctorSearch = lazy(() => 
  import('@/components/optimized/OptimizedDoctorSearch')
);

export const OptimizedAdminDashboard = lazy(() => 
  import('@/components/optimized/OptimizedAdminDashboard')
);

// Add performance monitoring wrapper for development
export const withPerformanceTracking = (Component: any, name: string) => {
  if (process.env.NODE_ENV === 'development') {
    return (props: any) => {
      const start = performance.now();
      
      React.useEffect(() => {
        const end = performance.now();
        console.log(`${name} render time: ${(end - start).toFixed(2)}ms`);
      });
      
      return <Component {...props} />;
    };
  }
  return Component;
};

export default {
  OptimizedDoctorSearch,
  OptimizedAdminDashboard,
  withPerformanceTracking
};