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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_inventory_needs: {
        Row: {
          created_at: string
          id: string
          item_name: string
          notes: string | null
          priority: string | null
          quantity: number
          unit: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          priority?: string | null
          quantity: number
          unit: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          priority?: string | null
          quantity?: number
          unit?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          status: string
          total_price: number
          unit_price: number
          updated_at: string
          vendor_id: string
          wholesaler_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          status?: string
          total_price: number
          unit_price: number
          updated_at?: string
          vendor_id: string
          wholesaler_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          status?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          vendor_id?: string
          wholesaler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wholesaler_products"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_preferences: {
        Row: {
          created_at: string
          id: string
          location: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wholesaler_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          in_stock: boolean
          price: number
          product_name: string
          unit: string
          updated_at: string
          wholesaler_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          in_stock?: boolean
          price: number
          product_name: string
          unit: string
          updated_at?: string
          wholesaler_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          in_stock?: boolean
          price?: number
          product_name?: string
          unit?: string
          updated_at?: string
          wholesaler_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "vendor" | "wholesaler"
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
      user_role: ["vendor", "wholesaler"],
    },
  },
} as const
