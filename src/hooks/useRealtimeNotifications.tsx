import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Notification {
  id: string;
  type: 'booking_created' | 'booking_approved' | 'booking_cancelled' | 'user_registered' | 'doctor_approved';
  title: string;
  message: string;
  data?: any;
  created_at: string;
  read: boolean;
}

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !profile) return;

    // Set up real-time listeners based on user role
    const setupRealtimeListeners = () => {
      console.log("Listening")
      // Listen for new bookings (for doctors and admins)
      if (profile.role === 'doctor' || profile.role === 'admin') {
        const bookingsChannel = supabase
          .channel('bookings-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'bookings'
            },
            (payload) => {
              console.log('New booking created:', payload);
              
              if (profile.role === 'admin') {
                // Notify admin of all new bookings
                addNotification({
                  type: 'booking_created',
                  title: 'New Booking',
                  message: 'A new appointment has been booked on the platform',
                  data: payload.new
                });
              } else if (profile.role === 'doctor') {
                // Notify doctor only of their bookings
                // We'll need to check if this booking is for this doctor
                fetchDoctorBookingNotification(payload.new);
              }
            }
          )
          // .subscribe();

        return [bookingsChannel];
      }

      // Listen for booking updates (for patients)
      if (profile.role === 'patient') {
        const userBookingsChannel = supabase
          .channel('user-bookings-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'bookings',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Booking updated:', payload);
              
              const booking = payload.new;
              if (booking.status === 'confirmed') {
                addNotification({
                  type: 'booking_approved',
                  title: 'Appointment Confirmed',
                  message: 'Your appointment has been confirmed by the doctor',
                  data: booking
                });
              }
            }
          )
          // .subscribe();

        return [userBookingsChannel];
      }

      // Listen for new user registrations (admins only)
      if (profile.role === 'admin') {
        const profilesChannel = supabase
          .channel('profiles-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'profiles'
            },
            (payload) => {
              console.log('New user registered:', payload);
              
              addNotification({
                type: 'user_registered',
                title: 'New User Registration',
                message: `New user ${payload.new.first_name} ${payload.new.last_name} has registered`,
                data: payload.new
              });
            }
          )
          // .subscribe();

        // Listen for doctor approvals
        const doctorsChannel = supabase
          .channel('doctors-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'doctors'
            },
            (payload) => {
              console.log('Doctor approved:', payload);
              
              addNotification({
                type: 'doctor_approved',
                title: 'Doctor Approved',
                message: 'A new doctor has been approved and added to the platform',
                data: payload.new
              });
            }
          )
          // .subscribe();

        return [profilesChannel, doctorsChannel];
      }

      return [];
    };

    const channels = setupRealtimeListeners();

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, profile]);

  const fetchDoctorBookingNotification = async (booking: any) => {
    try {
      // Get doctor info to check if this booking belongs to current user
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error || !doctor) return;

      if (doctor && booking.doctor_id === doctor.id) {
        addNotification({
          type: 'booking_created',
          title: 'New Appointment Booked',
          message: 'A patient has booked an appointment with you',
          data: booking
        });
      }
    } catch (error) {
      console.error('Error checking doctor booking:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};
