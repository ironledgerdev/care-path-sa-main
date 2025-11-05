import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: 'booking_created' | 'booking_approved' | 'booking_cancelled' | 'user_registered' | 'doctor_approved' | 'system' | 'warning' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'booking' | 'user' | 'doctor' | 'general';
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
  sound?: boolean;
  desktop?: boolean;
}

interface NotificationFilters {
  category?: string;
  priority?: string;
  read?: boolean;
  archived?: boolean;
}

interface NotificationSystemState {
  notifications: Notification[];
  unreadCount: number;
  filters: NotificationFilters;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'notification_system_state';
const MAX_NOTIFICATIONS = 100;

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationSystemState>({
    notifications: [],
    unreadCount: 0,
    filters: {},
    isLoading: false,
    error: null,
  });

  // Load persisted notifications
  useEffect(() => {
    const loadPersistedNotifications = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const validNotifications = parsed.filter((n: Notification) => {
            // Remove expired notifications
            if (n.expires_at && new Date(n.expires_at) < new Date()) {
              return false;
            }
            return true;
          });
          
          setState(prev => ({
            ...prev,
            notifications: validNotifications.slice(0, MAX_NOTIFICATIONS),
            unreadCount: validNotifications.filter((n: Notification) => !n.read && !n.archived).length,
          }));
        }
      } catch (error) {
        console.error('Failed to load persisted notifications:', error);
      }
    };

    loadPersistedNotifications();
  }, []);

  // Persist notifications to localStorage
  const persistNotifications = useCallback((notifications: Notification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }, []);

  // Request desktop notification permission
  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && 
        Notification.permission === 'granted' && 
        notification.desktop !== false) {
      
      const desktopNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });

      desktopNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        desktopNotif.close();
      };

      // Auto close after 5 seconds unless urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => desktopNotif.close(), 5000);
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback((priority: string) => {
    if (window.AudioContext || (window as any).webkitAudioContext) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different tones for different priorities
        const frequencies = {
          low: 400,
          medium: 600,
          high: 800,
          urgent: 1000
        };

        oscillator.frequency.setValueAtTime(frequencies[priority as keyof typeof frequencies] || 600, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }
    }
  }, []);

  // Add notification
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'created_at' | 'read' | 'archived'>) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false,
      archived: false,
      priority: 'medium',
      category: 'general',
      sound: true,
      desktop: true,
      ...notificationData,
    };

    setState(prev => {
      const newNotifications = [notification, ...prev.notifications].slice(0, MAX_NOTIFICATIONS);
      const newUnreadCount = newNotifications.filter(n => !n.read && !n.archived).length;
      
      persistNotifications(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    });

    // Show toast notification
    const toastVariant = notification.priority === 'urgent' ? 'destructive' : 
                        notification.priority === 'high' ? 'default' : 'default';
    
    toast({
      title: notification.title,
      description: notification.message,
      variant: toastVariant,
    });

    // Play sound if enabled
    if (notification.sound !== false) {
      playNotificationSound(notification.priority);
    }

    // Show desktop notification if enabled
    showDesktopNotification(notification);

    return notification.id;
  }, [persistNotifications, playNotificationSound, showDesktopNotification]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setState(prev => {
      const newNotifications = prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      const newUnreadCount = newNotifications.filter(n => !n.read && !n.archived).length;
      
      persistNotifications(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    });
  }, [persistNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setState(prev => {
      const newNotifications = prev.notifications.map(n => ({ ...n, read: true }));
      persistNotifications(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: 0,
      };
    });
  }, [persistNotifications]);

  // Archive notification
  const archiveNotification = useCallback((id: string) => {
    setState(prev => {
      const newNotifications = prev.notifications.map(n =>
        n.id === id ? { ...n, archived: true, read: true } : n
      );
      const newUnreadCount = newNotifications.filter(n => !n.read && !n.archived).length;
      
      persistNotifications(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    });
  }, [persistNotifications]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setState(prev => {
      const newNotifications = prev.notifications.filter(n => n.id !== id);
      const newUnreadCount = newNotifications.filter(n => !n.read && !n.archived).length;
      
      persistNotifications(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    });
  }, [persistNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
    persistNotifications([]);
  }, [persistNotifications]);

  // Set filters
  const setFilters = useCallback((filters: NotificationFilters) => {
    setState(prev => ({
      ...prev,
      filters,
    }));
  }, []);

  // Get filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = state.notifications;

    if (state.filters.category) {
      filtered = filtered.filter(n => n.category === state.filters.category);
    }
    if (state.filters.priority) {
      filtered = filtered.filter(n => n.priority === state.filters.priority);
    }
    if (typeof state.filters.read === 'boolean') {
      filtered = filtered.filter(n => n.read === state.filters.read);
    }
    if (typeof state.filters.archived === 'boolean') {
      filtered = filtered.filter(n => n.archived === state.filters.archived);
    }

    return filtered;
  }, [state.notifications, state.filters]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channels: any[] = [];

    // Listen to bookings for all user roles
    const bookingChannel = supabase
      .channel('booking-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          
          const booking = payload.new || payload.old;
          if (!booking) return;

          // Create notification based on event type and user role
          let notificationData: Partial<Notification> = {
            category: 'booking',
            priority: 'medium',
            metadata: { booking_id: (booking as any)?.id }
          };

          if (payload.eventType === 'INSERT') {
            if (user.user_metadata?.role === 'doctor' && (booking as any)?.doctor_id === user.id) {
              notificationData = {
                ...notificationData,
                type: 'booking_created',
                title: 'New Booking Request',
                message: `You have a new appointment request from ${(booking as any)?.patient_name || 'a patient'}`,
                priority: 'high',
              };
            } else if (user.user_metadata?.role === 'patient' && (booking as any)?.user_id === user.id) {
              notificationData = {
                ...notificationData,
                type: 'booking_created',
                title: 'Booking Submitted',
                message: 'Your appointment request has been submitted and is awaiting confirmation',
              };
            }
          } else if (payload.eventType === 'UPDATE') {
            const oldBooking = payload.old as any;
            const newBooking = booking as any;
            if (oldBooking?.status !== newBooking?.status) {
              if (newBooking?.status === 'confirmed' && newBooking?.user_id === user.id) {
                notificationData = {
                  ...notificationData,
                  type: 'booking_approved',
                  title: 'Appointment Confirmed',
                  message: `Your appointment has been confirmed for ${newBooking?.appointment_date ? new Date(newBooking.appointment_date).toLocaleDateString() : 'your scheduled time'}`,
                  priority: 'high',
                };
              } else if (newBooking?.status === 'cancelled' && newBooking?.user_id === user.id) {
                notificationData = {
                  ...notificationData,
                  type: 'booking_cancelled',
                  title: 'Appointment Cancelled',
                  message: 'Your appointment has been cancelled',
                  priority: 'high',
                };
              }
            }
          }

          if (notificationData.title) {
            addNotification(notificationData as Omit<Notification, 'id' | 'created_at' | 'read' | 'archived'>);
          }
        }
      )
      .subscribe();

    channels.push(bookingChannel);

    // Listen to profile changes and new applications for admin notifications
    if (user.user_metadata?.role === 'admin') {
      const profileChannel = supabase
        .channel('profile-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            const profile = payload.new as any;
            const oldProfile = payload.old as any;

            if (oldProfile.role !== profile.role && profile.role === 'doctor') {
              addNotification({
                type: 'doctor_approved',
                title: 'Doctor Approved',
                message: `${profile.first_name} ${profile.last_name} has been approved as a doctor`,
                category: 'doctor',
                priority: 'medium',
                metadata: { profile_id: profile.id },
                actionUrl: '/admin',
              });
            }
          }
        )
        .subscribe();

      const pendingDoctorsChannel = supabase
        .channel('pending-doctors-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pending_doctors'
          },
          (payload) => {
            const application = payload.new as any;
            addNotification({
              type: 'system',
              title: 'New Doctor Application',
              message: `${application.practice_name} • ${application.speciality}`,
              category: 'doctor',
              priority: 'high',
              metadata: { application_id: application.id, user_id: application.user_id },
              actionUrl: '/admin',
            });
          }
        )
        .subscribe();

      channels.push(profileChannel);
      channels.push(pendingDoctorsChannel);
    }

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, addNotification]);

  return {
    notifications: filteredNotifications,
    allNotifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    addNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAllNotifications,
    setFilters,
    requestDesktopPermission,
  };
};
