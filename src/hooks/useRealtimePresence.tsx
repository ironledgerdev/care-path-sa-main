import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PresenceState {
  user_id: string;
  online_at: string;
  status?: 'available' | 'busy' | 'away';
}

export const useRealtimePresence = (channelName: string = 'general') => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence-${channelName}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceState[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: PresenceState) => {
            users.push(presence);
          });
        });
        
        setOnlineUsers(users);
        setIsOnline(users.some(u => u.user_id === user.id));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const presenceTrackStatus = await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          status: 'available'
        });
        console.log('Presence tracked:', presenceTrackStatus);
      }
    });

    // Cleanup on unmount
    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user, channelName]);

  const updateStatus = async (status: 'available' | 'busy' | 'away') => {
    const channel = supabase.channel(`presence-${channelName}`);
    await channel.track({
      user_id: user?.id,
      online_at: new Date().toISOString(),
      status
    });
  };

  return {
    onlineUsers,
    isOnline,
    updateStatus,
    onlineCount: onlineUsers.length
  };
};