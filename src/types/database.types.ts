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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          drivers_license: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          drivers_license?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          drivers_license?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          amount_financed: number | null
          apr: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          deal_number: string
          doc_fee: number | null
          down_payment: number | null
          id: string
          lien_holder: string | null
          monthly_payment: number | null
          notes: string | null
          other_fees: number | null
          registration_fee: number | null
          sale_date: string | null
          sale_type: string | null
          salesperson: string | null
          selling_price: number | null
          status: string | null
          tax_amount: number | null
          tax_rate: number | null
          term: number | null
          title_fee: number | null
          total_price: number | null
          trade_allowance: number | null
          trade_payoff: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          amount_financed?: number | null
          apr?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          deal_number: string
          doc_fee?: number | null
          down_payment?: number | null
          id?: string
          lien_holder?: string | null
          monthly_payment?: number | null
          notes?: string | null
          other_fees?: number | null
          registration_fee?: number | null
          sale_date?: string | null
          sale_type?: string | null
          salesperson?: string | null
          selling_price?: number | null
          status?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          term?: number | null
          title_fee?: number | null
          total_price?: number | null
          trade_allowance?: number | null
          trade_payoff?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          amount_financed?: number | null
          apr?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          deal_number?: string
          doc_fee?: number | null
          down_payment?: number | null
          id?: string
          lien_holder?: string | null
          monthly_payment?: number | null
          notes?: string | null
          other_fees?: number | null
          registration_fee?: number | null
          sale_date?: string | null
          sale_type?: string | null
          salesperson?: string | null
          selling_price?: number | null
          status?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          term?: number | null
          title_fee?: number | null
          total_price?: number | null
          trade_allowance?: number | null
          trade_payoff?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          lead_id: string
          type: string | null
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          type?: string | null
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          customer_id: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          trade_vehicle: string | null
          updated_at: string | null
          vehicle_interest: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          trade_vehicle?: string | null
          updated_at?: string | null
          vehicle_interest?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          trade_vehicle?: string | null
          updated_at?: string | null
          vehicle_interest?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string
          id: string
          vehicle_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description: string
          id?: string
          vehicle_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string
          id?: string
          vehicle_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_costs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          alt: string | null
          id: string
          is_primary: boolean | null
          sort_order: number | null
          url: string
          vehicle_id: string
        }
        Insert: {
          alt?: string | null
          id?: string
          is_primary?: boolean | null
          sort_order?: number | null
          url: string
          vehicle_id: string
        }
        Update: {
          alt?: string | null
          id?: string
          is_primary?: boolean | null
          sort_order?: number | null
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          added_costs: number | null
          body_style: string | null
          buyer_fee: number | null
          created_at: string | null
          cylinders: number | null
          date_added: string | null
          date_sold: string | null
          description: string | null
          drivetrain: string | null
          engine: string | null
          exterior_color: string | null
          features: Json | null
          fuel_type: string | null
          gps_serial: string | null
          id: string
          interior_color: string | null
          location_code: string | null
          lot_fee: number | null
          make: string
          mileage: number | null
          mileage_type: string | null
          model: string
          purchase_date: string | null
          purchase_price: number | null
          selling_price: number | null
          status: string | null
          stock_number: string
          total_cost: number | null
          transmission: string | null
          trim: string | null
          updated_at: string | null
          vehicle_type: string | null
          vin: string
          year: number
        }
        Insert: {
          added_costs?: number | null
          body_style?: string | null
          buyer_fee?: number | null
          created_at?: string | null
          cylinders?: number | null
          date_added?: string | null
          date_sold?: string | null
          description?: string | null
          drivetrain?: string | null
          engine?: string | null
          exterior_color?: string | null
          features?: Json | null
          fuel_type?: string | null
          gps_serial?: string | null
          id?: string
          interior_color?: string | null
          location_code?: string | null
          lot_fee?: number | null
          make: string
          mileage?: number | null
          mileage_type?: string | null
          model: string
          purchase_date?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          status?: string | null
          stock_number: string
          total_cost?: number | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          vin: string
          year: number
        }
        Update: {
          added_costs?: number | null
          body_style?: string | null
          buyer_fee?: number | null
          created_at?: string | null
          cylinders?: number | null
          date_added?: string | null
          date_sold?: string | null
          description?: string | null
          drivetrain?: string | null
          engine?: string | null
          exterior_color?: string | null
          features?: Json | null
          fuel_type?: string | null
          gps_serial?: string | null
          id?: string
          interior_color?: string | null
          location_code?: string | null
          lot_fee?: number | null
          make?: string
          mileage?: number | null
          mileage_type?: string | null
          model?: string
          purchase_date?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          status?: string | null
          stock_number?: string
          total_cost?: number | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          vin?: string
          year?: number
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
