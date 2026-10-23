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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      containers: {
        Row: {
          ata: string | null
          atd: string | null
          created_at: string
          eta: string | null
          etd: string | null
          id: string
          number: string
          status: string
          updated_at: string
          vessel: string | null
          voyage: string | null
        }
        Insert: {
          ata?: string | null
          atd?: string | null
          created_at?: string
          eta?: string | null
          etd?: string | null
          id?: string
          number: string
          status?: string
          updated_at?: string
          vessel?: string | null
          voyage?: string | null
        }
        Update: {
          ata?: string | null
          atd?: string | null
          created_at?: string
          eta?: string | null
          etd?: string | null
          id?: string
          number?: string
          status?: string
          updated_at?: string
          vessel?: string | null
          voyage?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          clearing_fee: number
          created_at: string
          currency: string
          delivery_fee: number
          freight_fee: number
          id: string
          paid: boolean
          shipment_id: string
          updated_at: string
        }
        Insert: {
          clearing_fee?: number
          created_at?: string
          currency?: string
          delivery_fee?: number
          freight_fee?: number
          id?: string
          paid?: boolean
          shipment_id: string
          updated_at?: string
        }
        Update: {
          clearing_fee?: number
          created_at?: string
          currency?: string
          delivery_fee?: number
          freight_fee?: number
          id?: string
          paid?: boolean
          shipment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: true
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          enabled: boolean
          stage: string
          updated_at: string
        }
        Insert: {
          body: string
          enabled?: boolean
          stage: string
          updated_at?: string
        }
        Update: {
          body?: string
          enabled?: boolean
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          attempts: number
          body: string
          created_at: string
          error: string | null
          id: string
          phone: string
          provider_message_id: string | null
          sent_at: string | null
          shipment_id: string | null
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          body: string
          created_at?: string
          error?: string | null
          id?: string
          phone: string
          provider_message_id?: string | null
          sent_at?: string | null
          shipment_id?: string | null
          stage: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          body?: string
          created_at?: string
          error?: string | null
          id?: string
          phone?: string
          provider_message_id?: string | null
          sent_at?: string | null
          shipment_id?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          company: string | null
          contact_name: string
          created_at: string
          destination: string
          email: string
          goods: string | null
          id: string
          mode: string
          notes: string | null
          origin: string
          phone: string | null
          status: string
          volume_cbm: number | null
          weight_kg: number | null
        }
        Insert: {
          company?: string | null
          contact_name: string
          created_at?: string
          destination: string
          email: string
          goods?: string | null
          id?: string
          mode: string
          notes?: string | null
          origin: string
          phone?: string | null
          status?: string
          volume_cbm?: number | null
          weight_kg?: number | null
        }
        Update: {
          company?: string | null
          contact_name?: string
          created_at?: string
          destination?: string
          email?: string
          goods?: string | null
          id?: string
          mode?: string
          notes?: string | null
          origin?: string
          phone?: string | null
          status?: string
          volume_cbm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          photo_path: string | null
          shipment_id: string
          stage: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          photo_path?: string | null
          shipment_id: string
          stage: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          photo_path?: string | null
          shipment_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          container_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          delivered_at: string | null
          delivery_address: string | null
          description: string | null
          driver: string | null
          id: string
          pieces: number | null
          platform_tracking_no: string | null
          sender_address: string | null
          sender_name: string | null
          sender_phone: string | null
          stage: string
          tracking_id: string
          updated_at: string
          volume_cbm: number | null
          weight_kg: number | null
        }
        Insert: {
          container_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          delivered_at?: string | null
          delivery_address?: string | null
          description?: string | null
          driver?: string | null
          id?: string
          pieces?: number | null
          platform_tracking_no?: string | null
          sender_address?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          stage?: string
          tracking_id?: string
          updated_at?: string
          volume_cbm?: number | null
          weight_kg?: number | null
        }
        Update: {
          container_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string | null
          description?: string | null
          driver?: string | null
          id?: string
          pieces?: number | null
          platform_tracking_no?: string | null
          sender_address?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          stage?: string
          tracking_id?: string
          updated_at?: string
          volume_cbm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_container_id_fkey"
            columns: ["container_id"]
            isOneToOne: false
            referencedRelation: "containers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enqueue_notification: {
        Args: { _shipment: string; _stage: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "staff"
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
    Enums: {
      app_role: ["admin", "user", "staff"],
    },
  },
} as const
