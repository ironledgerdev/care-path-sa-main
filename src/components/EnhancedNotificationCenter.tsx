import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  BellRing, 
  Calendar, 
  CheckCircle, 
  Clock, 
  X, 
  Trash2,
  MessageSquare,
  UserCheck,
  Heart,
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'doctor' | 'system' | 'message' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
}

interface EnhancedNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedNotificationCenter: React.FC<EnhancedNotificationCenterProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real app, you would fetch from a notifications table
      // For now, we'll simulate notifications based on user activity
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user.id,
          title: 'Appointment Confirmed',
          message: 'Your appointment with Dr. Sarah Johnson has been confirmed for tomorrow at 2:00 PM.',
          type: 'appointment',
          priority: 'high',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          action_url: '/bookings',
          metadata: { doctor_name: 'Dr. Sarah Johnson', appointment_time: '2:00 PM' }
        },
        {
          id: '2',
          user_id: user.id,
          title: 'New Doctor Available',
          message: 'Dr. Michael Chen, a cardiologist, has joined our platform and is accepting new patients.',
          type: 'doctor',
          priority: 'medium',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          action_url: '/search?specialty=Cardiologist'
        },
        {
          id: '3',
          user_id: user.id,
          title: 'Appointment Reminder',
          message: 'You have an upcoming appointment tomorrow. Please remember to bring your ID and insurance card.',
          type: 'reminder',
          priority: 'medium',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        },
        {
          id: '4',
          user_id: user.id,
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.',
          type: 'system',
          priority: 'low',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    // Set up real-time subscriptions for various tables
    const channels = [];

    // Listen for booking changes
    const bookingsChannel = supabase
      .channel('user_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          handleBookingNotification(payload);
        }
      )
      .subscribe();

    channels.push(bookingsChannel);

    // Listen for doctor approvals (if user is a doctor)
    if (profile?.role === 'doctor') {
      const doctorChannel = supabase
        .channel('doctor_status_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'doctors',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Doctor approval detected:', payload);
            handleDoctorApprovalNotification();
          }
        )
        .subscribe();

      channels.push(doctorChannel);
    }

    // Cleanup function
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  };

  const handleBookingNotification = (payload: any) => {
    const event = payload.eventType;
    const booking = payload.new || payload.old;
    
    let title = '';
    let message = '';
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    switch (event) {
      case 'INSERT':
        title = 'Booking Created';
        message = 'Your appointment booking has been submitted and is pending confirmation.';
        break;
      case 'UPDATE':
        if (booking.status === 'confirmed') {
          title = 'Appointment Confirmed';
          message = 'Your appointment has been confirmed by the doctor.';
          priority = 'high';
        } else if (booking.status === 'cancelled') {
          title = 'Appointment Cancelled';
          message = 'Your appointment has been cancelled.';
          priority = 'high';
        }
        break;
    }

    if (title && message) {
      addNotification({
        title,
        message,
        type: 'appointment',
        priority,
        action_url: '/bookings'
      });
    }
  };

  const handleDoctorApprovalNotification = () => {
    addNotification({
      title: 'Doctor Application Approved',
      message: 'Congratulations! Your doctor application has been approved. You can now accept bookings.',
      type: 'doctor',
      priority: 'high',
      action_url: '/doctor'
    });
  };

  const addNotification = (notification: Partial<Notification>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'system',
      priority: notification.priority || 'medium',
      is_read: false,
      created_at: new Date().toISOString(),
      action_url: notification.action_url,
      metadata: notification.metadata
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast for high priority notifications
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const newNotifications = prev.filter(n => n.id !== notificationId);
      
      if (notification && !notification.is_read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return newNotifications;
    });
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'doctor':
        return <UserCheck className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'system':
        return priority === 'urgent' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="fixed right-4 top-4 w-96 max-h-[80vh] bg-background rounded-lg shadow-2xl border">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh]">
              {isLoading ? (
                <div className="p-6 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            
                            {notification.action_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  window.location.href = notification.action_url!;
                                }}
                              >
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedNotificationCenter;