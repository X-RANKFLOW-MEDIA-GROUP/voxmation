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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      automations: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          last_triggered_at: string | null
          name: string
          status: string | null
          trigger_count: number | null
          type: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_triggered_at?: string | null
          name: string
          status?: string | null
          trigger_count?: number | null
          type: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_triggered_at?: string | null
          name?: string
          status?: string | null
          trigger_count?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          scheduled_at: string
          service_type: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          scheduled_at: string
          service_type?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string
          service_type?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_type: string | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          outcome: string | null
          recording_url: string | null
          sentiment: string | null
          status: string | null
          summary: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          call_type?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          outcome?: string | null
          recording_url?: string | null
          sentiment?: string | null
          status?: string | null
          summary?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          call_type?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          outcome?: string | null
          recording_url?: string | null
          sentiment?: string | null
          status?: string | null
          summary?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          connected_at: string | null
          created_at: string | null
          id: string
          provider: string
          status: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          provider: string
          status?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          provider?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          lead_score: number | null
          name: string
          notes: string | null
          phone: string | null
          service_requested: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_score?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          service_requested?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_score?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          service_requested?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      website_leads: {
        Row: {
          business_name: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          industry: string | null
          monthly_call_volume: string | null
          page_source: string | null
          phone: string
          source: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          industry?: string | null
          monthly_call_volume?: string | null
          page_source?: string | null
          phone: string
          source?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          industry?: string | null
          monthly_call_volume?: string | null
          page_source?: string | null
          phone?: string
          source?: string | null
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
