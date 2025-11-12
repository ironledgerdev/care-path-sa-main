import { supabase } from './client';

export type Unsubscribe = () => void;

export const Realtime = {
  presenceChannel(name: string) {
    return supabase.channel(name);
  },

  subscribeToTable<T = any>(table: string, filter: string, cb: (payload: T) => void): Unsubscribe {
    const channel = supabase
      .channel(`${table}-changes-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload) => cb(payload as any))
      .subscribe();

    return () => {
      try { channel.unsubscribe(); } catch {}
      try { supabase.removeChannel(channel); } catch {}
    };
  },

  cleanupAll() {
    try { supabase.removeAllChannels(); } catch {}
  }
};
