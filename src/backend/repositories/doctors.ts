import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '../client';

export type Doctor = Tables<'doctors'>;
export type DoctorInsert = TablesInsert<'doctors'>;
export type DoctorUpdate = TablesUpdate<'doctors'>;
export type DoctorSchedule = Tables<'doctor_schedules'>;
export type DoctorScheduleInsert = TablesInsert<'doctor_schedules'>;
export type DoctorScheduleUpdate = TablesUpdate<'doctor_schedules'>;

export const DoctorsRepo = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Doctor | null;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as Doctor | null;
  },

  async list(filters?: Partial<Pick<Doctor, 'city' | 'province' | 'speciality' | 'is_available'>>) {
    let q = supabase.from('doctors').select('*');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        // @ts-expect-error narrowed keys
        q = q.eq(k, v as any);
      });
    }
    const { data, error } = await q;
    if (error) throw error;
    return data as Doctor[];
  },

  async create(payload: DoctorInsert) {
    const { data, error } = await supabase
      .from('doctors')
      .insert(payload)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Doctor;
  },

  async update(id: string, update: DoctorUpdate) {
    const { data, error } = await supabase
      .from('doctors')
      .update(update)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Doctor;
  },

  // schedules
  async getSchedules(doctorId: string) {
    const { data, error } = await supabase
      .from('doctor_schedules')
      .select('*')
      .eq('doctor_id', doctorId);
    if (error) throw error;
    return data as DoctorSchedule[];
  },

  async upsertSchedules(rows: DoctorScheduleInsert[], onConflict: string = 'doctor_id,day_of_week') {
    const { data, error } = await supabase
      .from('doctor_schedules')
      .upsert(rows as any, { onConflict })
      .select('*');
    if (error) throw error;
    return data as DoctorSchedule[];
  },

  async clearSchedules(doctorId: string) {
    const { error } = await supabase
      .from('doctor_schedules')
      .delete()
      .eq('doctor_id', doctorId);
    if (error) throw error;
  },
};
