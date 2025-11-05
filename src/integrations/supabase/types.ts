export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          appointment_date: string
          appointment_time: string
          booking_fee: number
          consultation_fee: number
          created_at: string
          created_by: string | null
          doctor_id: string
          doctor_notes: string | null
          id: string
          patient_notes: string | null
          payment_reference: string | null
          payment_status: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          booking_fee?: number
          consultation_fee: number
          created_at?: string
          created_by?: string | null
          doctor_id: string
          doctor_notes?: string | null
          id?: string
          patient_notes?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          booking_fee?: number
          consultation_fee?: number
          created_at?: string
          created_by?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          id?: string
          patient_notes?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          address: string
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          city: string
          consultation_fee: number
          created_at: string
          id: string
          is_available: boolean | null
          license_number: string
          postal_code: string
          practice_name: string
          profile_image_url: string | null
          province: string
          qualification: string
          rating: number | null
          speciality: string
          total_bookings: number | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          address: string
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          city: string
          consultation_fee: number
          created_at?: string
          id?: string
          is_available?: boolean | null
          license_number: string
          postal_code: string
          practice_name: string
          profile_image_url?: string | null
          province: string
          qualification: string
          rating?: number | null
          speciality: string
          total_bookings?: number | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          city?: string
          consultation_fee?: number
          created_at?: string
          id?: string
          is_available?: boolean | null
          license_number?: string
          postal_code?: string
          practice_name?: string
          profile_image_url?: string | null
          province?: string
          qualification?: string
          rating?: number | null
          speciality?: string
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          free_bookings_remaining: number | null
          id: string
          is_active: boolean | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          free_bookings_remaining?: number | null
          id?: string
          is_active?: boolean | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          free_bookings_remaining?: number | null
          id?: string
          is_active?: boolean | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_doctors: {
        Row: {
          address: string
          admin_notes: string | null
          bio: string | null
          city: string
          consultation_fee: number
          created_at: string
          id: string
          license_number: string
          postal_code: string
          practice_name: string
          profile_image_url: string | null
          province: string
          qualification: string
          qualification_documents: string[] | null
          speciality: string
          status: Database["public"]["Enums"]["doctor_status"]
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          bio?: string | null
          city: string
          consultation_fee: number
          created_at?: string
          id?: string
          license_number: string
          postal_code: string
          practice_name: string
          profile_image_url?: string | null
          province: string
          qualification: string
          qualification_documents?: string[] | null
          speciality: string
          status?: Database["public"]["Enums"]["doctor_status"]
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          bio?: string | null
          city?: string
          consultation_fee?: number
          created_at?: string
          id?: string
          license_number?: string
          postal_code?: string
          practice_name?: string
          profile_image_url?: string | null
          province?: string
          qualification?: string
          qualification_documents?: string[] | null
          speciality?: string
          status?: Database["public"]["Enums"]["doctor_status"]
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      doctor_status: "pending" | "approved" | "rejected" | "suspended"
      membership_type: "basic" | "premium"
      user_role: "patient" | "doctor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      doctor_status: ["pending", "approved", "rejected", "suspended"],
      membership_type: ["basic", "premium"],
      user_role: ["patient", "doctor", "admin"],
    },
  },
} as const
