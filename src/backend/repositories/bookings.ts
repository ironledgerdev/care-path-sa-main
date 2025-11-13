import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '../client';

export type Booking = Tables<'bookings'>;
export type BookingInsert = TablesInsert<'bookings'>;
export type BookingUpdate = TablesUpdate<'bookings'>;

export const BookingsRepo = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Booking | null;
  },

  async listForUser(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Booking[];
  },

  async listForDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Booking[];
  },

  async countForDoctor(doctorId: string) {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctorId);
    if (error) throw error;
    return count || 0;
  },

  async create(payload: BookingInsert) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Booking;
  },

  async update(id: string, update: BookingUpdate) {
    const { data, error } = await supabase
      .from('bookings')
      .update(update)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Booking;
  },

  async hasConflict(doctorId: string, date: string, time: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .limit(1);
    if (error) throw error;
    const conflict = (data || []).find(b => b.status !== 'cancelled');
    return Boolean(conflict);
  },
};
