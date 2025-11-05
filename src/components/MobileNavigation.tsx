import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function MobileNavigation() {
  return (
    <div className="flex items-center gap-2 md:hidden">
      <SidebarTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SidebarTrigger>
    </div>
  );
}