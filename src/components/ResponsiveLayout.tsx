import React from 'react';
import Header from './Header';
import { MobileHeader } from './MobileHeader';
import { useSidebar } from '@/components/ui/sidebar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { open } = useSidebar();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${open ? 'md:ml-64' : 'md:ml-14'}`}>
        {children}
      </div>
    </div>
  );
}