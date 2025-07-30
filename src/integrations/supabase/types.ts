export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          address: string
          appointment_date: string
          cancellation_reason: string | null
          client_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          end_time: string
          hourly_rate: number | null
          id: string
          nurse_id: string
          service_type: string
          special_instructions: string | null
          start_time: string
          status: string
          title: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          address: string
          appointment_date: string
          cancellation_reason?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time: string
          hourly_rate?: number | null
          id?: string
          nurse_id: string
          service_type: string
          special_instructions?: string | null
          start_time: string
          status?: string
          title?: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          appointment_date?: string
          cancellation_reason?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string
          hourly_rate?: number | null
          id?: string
          nurse_id?: string
          service_type?: string
          special_instructions?: string | null
          start_time?: string
          status?: string
          title?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          care_description: string | null
          care_type: string[] | null
          created_at: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          language_preference: string | null
          medical_conditions: string[] | null
          mobility_level: string | null
          preferred_gender: string | null
          profile_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          care_description?: string | null
          care_type?: string[] | null
          created_at?: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          language_preference?: string | null
          medical_conditions?: string[] | null
          mobility_level?: string | null
          preferred_gender?: string | null
          profile_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          care_description?: string | null
          care_type?: string[] | null
          created_at?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          language_preference?: string | null
          medical_conditions?: string[] | null
          mobility_level?: string | null
          preferred_gender?: string | null
          profile_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          appointment_id: string | null
          content: string
          conversation_id: string
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          appointment_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          appointment_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      nurse_availability: {
        Row: {
          break_duration_minutes: number | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          max_clients_per_slot: number | null
          nurse_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          max_clients_per_slot?: number | null
          nurse_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_clients_per_slot?: number | null
          nurse_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      nurse_profiles: {
        Row: {
          availability_schedule: Json | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          hourly_rate: number | null
          id: string
          insurance_verified: boolean | null
          is_background_checked: boolean | null
          license_expiry: string
          license_number: string
          license_state: string
          profile_id: string
          specialties: string[] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          insurance_verified?: boolean | null
          is_background_checked?: boolean | null
          license_expiry: string
          license_number: string
          license_state: string
          profile_id: string
          specialties?: string[] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          insurance_verified?: boolean | null
          is_background_checked?: boolean | null
          license_expiry?: string
          license_number?: string
          license_state?: string
          profile_id?: string
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nurse_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_verified: boolean | null
          last_name: string
          phone: string | null
          profile_image_url: string | null
          role: string
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          is_verified?: boolean | null
          last_name: string
          phone?: string | null
          profile_image_url?: string | null
          role: string
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_verified?: boolean | null
          last_name?: string
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string
          communication: number | null
          created_at: string
          id: string
          is_public: boolean | null
          punctuality: number | null
          rating: number
          review_text: string | null
          reviewed_id: string
          reviewer_id: string
          service_quality: number | null
          updated_at: string
          would_recommend: boolean | null
        }
        Insert: {
          appointment_id: string
          communication?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          punctuality?: number | null
          rating: number
          review_text?: string | null
          reviewed_id: string
          reviewer_id: string
          service_quality?: number | null
          updated_at?: string
          would_recommend?: boolean | null
        }
        Update: {
          appointment_id?: string
          communication?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          punctuality?: number | null
          rating?: number
          review_text?: string | null
          reviewed_id?: string
          reviewer_id?: string
          service_quality?: number | null
          updated_at?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_professionals: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          nurse_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          nurse_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          nurse_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
