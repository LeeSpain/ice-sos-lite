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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type: string
          metadata?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invite_token: string
          invitee_email: string
          invitee_name: string
          inviter_email: string
          inviter_user_id: string
          relationship: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          invite_token?: string
          invitee_email: string
          invitee_name: string
          inviter_email: string
          inviter_user_id: string
          relationship?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invitee_email?: string
          invitee_name?: string
          inviter_email?: string
          inviter_user_id?: string
          relationship?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          conversation_summary: string | null
          created_at: string
          email: string | null
          id: string
          interest_level: number | null
          metadata: Json | null
          phone: string | null
          recommended_plan: string | null
          session_id: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conversation_summary?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest_level?: number | null
          metadata?: Json | null
          phone?: string | null
          recommended_plan?: string | null
          session_id: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conversation_summary?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest_level?: number | null
          metadata?: Json | null
          phone?: string | null
          recommended_plan?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
          sort_order: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          compatibility: string[] | null
          created_at: string
          currency: string | null
          description: string | null
          dimensions: Json | null
          features: string[] | null
          id: string
          images: Json | null
          inventory_count: number | null
          name: string
          price: number
          sku: string | null
          sort_order: number | null
          status: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          compatibility?: string[] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          features?: string[] | null
          id?: string
          images?: Json | null
          inventory_count?: number | null
          name: string
          price: number
          sku?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          compatibility?: string[] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          features?: string[] | null
          id?: string
          images?: Json | null
          inventory_count?: number | null
          name?: string
          price?: number
          sku?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_type: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contacts: Json | null
          first_name: string | null
          id: string
          language_preference: string | null
          last_name: string | null
          location_sharing_enabled: boolean | null
          medical_conditions: string[] | null
          medications: string[] | null
          phone: string | null
          profile_completion_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contacts?: Json | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          location_sharing_enabled?: boolean | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          phone?: string | null
          profile_completion_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contacts?: Json | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          location_sharing_enabled?: boolean | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          phone?: string | null
          profile_completion_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_product_compatibility: {
        Row: {
          compatibility_notes: string | null
          created_at: string
          id: string
          product_id: string | null
          service_name: string
        }
        Insert: {
          compatibility_notes?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          service_name: string
        }
        Update: {
          compatibility_notes?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_product_compatibility_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price: number
          sort_order: number | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price: number
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
