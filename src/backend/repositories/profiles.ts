import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '../client';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export const ProfilesRepo = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  async upsert(update: ProfileInsert | ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(update as any)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  async setRole(userId: string, role: Enums<'user_role'>) {
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },

  async listBasic(ids?: string[]) {
    let q = supabase.from('profiles').select('id, first_name, last_name, email, role');
    if (ids && ids.length) q = q.in('id', ids);
    const { data, error } = await q;
    if (error) throw error;
    return data as Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'role'>[];
  },

  async isAdmin(userId: string) {
    const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
    if (error) throw error;
    return Boolean(data);
  },
};
