import React, { useState, lazy, Suspense } from 'react';
import { Bell, X, Settings, Archive, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

// Lazy load notification components for better performance
const NotificationItem = lazy(() => import('./NotificationItem'));
const NotificationFilters = lazy(() => import('./NotificationFilters'));
const NotificationSettings = lazy(() => import('./NotificationSettings'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-muted h-4 w-4"></div>
      <div className="flex-1 space-y-2">
        <div className="h-2 bg-muted rounded w-3/4"></div>
        <div className="h-2 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAllNotifications,
    setFilters,
    filters,
    requestDesktopPermission,
  } = useNotificationSystem();

  const getTabNotifications = (tab: string) => {
    switch (tab) {
      case 'unread':
        return notifications.filter(n => !n.read && !n.archived);
      case 'archived':
        return notifications.filter(n => n.archived);
      case 'urgent':
        return notifications.filter(n => n.priority === 'urgent' && !n.archived);
      default:
        return notifications.filter(n => !n.archived);
    }
  };

  const tabNotifications = getTabNotifications(activeTab);
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read && !n.archived).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-auto hover:bg-accent/50 transition-all duration-200"
        >
          <Bell className={`h-5 w-5 transition-all duration-200 ${unreadCount > 0 ? 'animate-pulse text-primary' : ''}`} />
          {unreadCount > 0 && (
            <Badge 
              variant={urgentCount > 0 ? "destructive" : "secondary"}
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs h-auto p-2"
                >
                  <Filter className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-xs h-auto p-2"
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-auto p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  {urgentCount > 0 && (
                    <span className="text-destructive font-medium ml-1">
                      ({urgentCount} urgent)
                    </span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-auto p-1 text-primary hover:text-primary"
                >
                  Mark all read
                </Button>
              </div>
            )}
          </CardHeader>
          
          <Separator />

          {/* Filters Section */}
          {showFilters && (
            <div className="p-3 bg-muted/20">
              <Suspense fallback={<LoadingSpinner />}>
                <NotificationFilters 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </Suspense>
            </div>
          )}

          {/* Settings Section */}
          {showSettings && (
            <div className="p-3 bg-muted/20">
              <Suspense fallback={<LoadingSpinner />}>
                <NotificationSettings 
                  onRequestPermission={requestDesktopPermission}
                />
              </Suspense>
            </div>
          )}
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none">
                <TabsTrigger value="all" className="text-xs">
                  All
                  <Badge variant="secondary" className="ml-1 h-4 text-xs">
                    {notifications.filter(n => !n.archived).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="urgent" className="text-xs">
                  Urgent
                  {urgentCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 text-xs">
                      {urgentCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs">
                  <Archive className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {tabNotifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">
                      {activeTab === 'unread' ? 'No unread notifications' :
                       activeTab === 'urgent' ? 'No urgent notifications' :
                       activeTab === 'archived' ? 'No archived notifications' :
                       'No notifications yet'}
                    </p>
                    <p className="text-xs mt-1">
                      {activeTab === 'all' && "We'll notify you when something happens"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    <div className="p-1">
                      <Suspense fallback={<LoadingSpinner />}>
                        {tabNotifications.map((notification, index) => (
                          <div key={notification.id}>
                            <NotificationItem
                              notification={notification}
                              onMarkAsRead={() => markAsRead(notification.id)}
                              onArchive={() => archiveNotification(notification.id)}
                              onDelete={() => deleteNotification(notification.id)}
                            />
                            {index < tabNotifications.length - 1 && (
                              <Separator className="mx-3" />
                            )}
                          </div>
                        ))}
                      </Suspense>
                      
                      {activeTab === 'all' && notifications.filter(n => !n.archived).length > 0 && (
                        <div className="p-3 border-t bg-muted/20">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllNotifications}
                            className="w-full text-xs text-muted-foreground hover:text-destructive"
                          >
                            Clear all notifications
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};