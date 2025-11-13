import { supabase } from './client';

export const Storage = {
  async uploadProfileImage(userId: string, file: File) {
    const path = `doctors/${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  },

  async createSignedUrl(path: string, expiresInSeconds = 60 * 10) {
    const { data, error } = await supabase.storage
      .from('profile-images')
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data?.signedUrl || null;
  },
};
