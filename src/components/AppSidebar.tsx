import React from 'react';
import { 
  Home, 
  Search, 
  CreditCard, 
  Info, 
  Users, 
  FileText, 
  Stethoscope,
  Calendar,
  User,
  Settings
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from '@/hooks/useAuth';

// Main navigation items
const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Find Doctors", url: "/search", icon: Search },
  { title: "Memberships", url: "/memberships", icon: CreditCard },
  { title: "About Us", url: "/about", icon: Info },
  { title: "Meet the Team", url: "/team", icon: Users },
  { title: "Legal", url: "/legal", icon: FileText },
];

// User-specific navigation items
const userNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: User, roles: ['patient'] },
  { title: "Bookings", url: "/bookings", icon: Calendar, roles: ['patient'] },
  { title: "Doctor Dashboard", url: "/doctor", icon: Stethoscope, roles: ['doctor'] },
  { title: "Admin Dashboard", url: "/admin", icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const { user, profile } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      active 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:bg-muted'
    }`;
  };

  // Filter user nav items based on role
  const availableUserNavItems = userNavItems.filter(item => 
    !item.roles || (profile?.role && item.roles.includes(profile.role))
  );

  return (
    <Sidebar className={open ? "w-64" : "w-14"} collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          {open && (
            <div>
              <h2 className="text-lg font-semibold">HealthCare</h2>
              <p className="text-xs text-muted-foreground">Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {open ? "Navigation" : "Nav"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className={({ isActive }) => 
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:bg-muted'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Navigation - Only show if logged in */}
        {user && availableUserNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {open ? "Account" : "User"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {availableUserNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) => 
                          `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-muted-foreground hover:bg-muted'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        {user ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {profile?.role || 'User'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-3">
            <SidebarMenuButton asChild>
              <button
                onClick={() => window.dispatchEvent(new Event('openAuthModal'))}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground hover:bg-muted"
              >
                <User className="h-4 w-4" />
                {open && <span>Sign In</span>}
              </button>
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
