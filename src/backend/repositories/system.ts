import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '../client';

export type SystemSetting = Tables<'system_settings'>;
export type SystemSettingInsert = TablesInsert<'system_settings'>;
export type SystemSettingUpdate = TablesUpdate<'system_settings'>;

export const SystemRepo = {
  async get(setting_key: string) {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', setting_key)
      .maybeSingle();
    if (error) throw error;
    return data as SystemSetting | null;
  },

  async set(setting_key: string, setting_value: string, description?: string) {
    const payload: SystemSettingInsert = {
      setting_key,
      setting_value,
      description: description ?? null,
      updated_at: new Date().toISOString(),
      updated_by: null,
    } as any;
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(payload, { onConflict: 'setting_key' })
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as SystemSetting | null;
  },
};
