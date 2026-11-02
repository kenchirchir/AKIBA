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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          duration_seconds: number | null
          event_type: string
          garment_id: string | null
          id: number
          participant_code: string | null
          tailor_id: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          event_type: string
          garment_id?: string | null
          id?: never
          participant_code?: string | null
          tailor_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          event_type?: string
          garment_id?: string | null
          id?: never
          participant_code?: string | null
          tailor_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
        ]
      }
      garment_photos: {
        Row: {
          created_at: string
          garment_id: string
          height: number | null
          id: string
          position: number
          public_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          garment_id: string
          height?: number | null
          id?: string
          position?: number
          public_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          garment_id?: string
          height?: number | null
          id?: string
          position?: number
          public_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "garment_photos_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garments"
            referencedColumns: ["id"]
          },
        ]
      }
      garments: {
        Row: {
          audience: string
          category: string
          created_at: string
          description: string | null
          id: string
          is_sample: boolean
          making_days: number | null
          material: string | null
          name: string
          price_rwf: number
          published_at: string | null
          rejection_reason: string | null
          status: string
          story: string
          subcategory: string | null
          tailor_id: string
          updated_at: string
        }
        Insert: {
          audience?: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_sample?: boolean
          making_days?: number | null
          material?: string | null
          name: string
          price_rwf: number
          published_at?: string | null
          rejection_reason?: string | null
          status?: string
          story: string
          subcategory?: string | null
          tailor_id: string
          updated_at?: string
        }
        Update: {
          audience?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sample?: boolean
          making_days?: number | null
          material?: string | null
          name?: string
          price_rwf?: number
          published_at?: string | null
          rejection_reason?: string | null
          status?: string
          story?: string
          subcategory?: string | null
          tailor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "garments_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
        ]
      }
      pin_attempts: {
        Row: {
          failures: number
          locked_until: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          failures?: number
          locked_until?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          failures?: number
          locked_until?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          best_time: string | null
          buyer_name: string
          buyer_phone: string
          created_at: string
          garment_id: string | null
          id: string
          needed_by: string | null
          ordered_at: string | null
          quantity: number
          read_at: string | null
          size: string
          sms_sent_at: string | null
          status: string
          tailor_id: string
          visitor_id: string | null
        }
        Insert: {
          best_time?: string | null
          buyer_name: string
          buyer_phone: string
          created_at?: string
          garment_id?: string | null
          id?: string
          needed_by?: string | null
          ordered_at?: string | null
          quantity?: number
          read_at?: string | null
          size: string
          sms_sent_at?: string | null
          status?: string
          tailor_id: string
          visitor_id?: string | null
        }
        Update: {
          best_time?: string | null
          buyer_name?: string
          buyer_phone?: string
          created_at?: string
          garment_id?: string | null
          id?: string
          needed_by?: string | null
          ordered_at?: string | null
          quantity?: number
          read_at?: string | null
          size?: string
          sms_sent_at?: string | null
          status?: string
          tailor_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
        ]
      }
      tailor_verifications: {
        Row: {
          association: string | null
          consent_given: boolean
          created_at: string
          notes: string | null
          official_name: string | null
          tailor_id: string
          updated_at: string
          verified_by: string | null
          visit_date: string | null
        }
        Insert: {
          association?: string | null
          consent_given?: boolean
          created_at?: string
          notes?: string | null
          official_name?: string | null
          tailor_id: string
          updated_at?: string
          verified_by?: string | null
          visit_date?: string | null
        }
        Update: {
          association?: string | null
          consent_given?: boolean
          created_at?: string
          notes?: string | null
          official_name?: string | null
          tailor_id?: string
          updated_at?: string
          verified_by?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tailor_verifications_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: true
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tailors: {
        Row: {
          about: string | null
          avatar_public_id: string | null
          cover_public_id: string | null
          created_at: string
          district: string
          id: string
          is_sample: boolean
          owner_name: string
          profile_id: string | null
          sector: string
          shop_address: string | null
          shop_name: string
          sms_alerts: boolean
          status: string
          tailoring_since: string | null
          tailoring_types: string[]
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          about?: string | null
          avatar_public_id?: string | null
          cover_public_id?: string | null
          created_at?: string
          district: string
          id?: string
          is_sample?: boolean
          owner_name: string
          profile_id?: string | null
          sector: string
          shop_address?: string | null
          shop_name: string
          sms_alerts?: boolean
          status?: string
          tailoring_since?: string | null
          tailoring_types?: string[]
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          about?: string | null
          avatar_public_id?: string | null
          cover_public_id?: string | null
          created_at?: string
          district?: string
          id?: string
          is_sample?: boolean
          owner_name?: string
          profile_id?: string | null
          sector?: string
          shop_address?: string | null
          shop_name?: string
          sms_alerts?: boolean
          status?: string
          tailoring_since?: string | null
          tailoring_types?: string[]
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tailors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      my_garment_views: {
        Args: never
        Returns: {
          garment_id: string
          views: number
        }[]
      }
      owns_tailor: { Args: { target: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
