import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '../client';

export type Membership = Tables<'memberships'>;
export type MembershipInsert = TablesInsert<'memberships'>;
export type MembershipUpdate = TablesUpdate<'memberships'>;

export const MembershipsRepo = {
  async getForUser(userId: string) {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as Membership | null;
  },

  async upsert(payload: MembershipInsert | MembershipUpdate) {
    const { data, error } = await supabase
      .from('memberships')
      .upsert(payload as any)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Membership | null;
  },
};
