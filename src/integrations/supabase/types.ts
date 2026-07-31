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
      activity_logs: {
        Row: {
          action: string
          actor_email: string
          created_at: string
          details: string
          entity: string
          entity_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string
          created_at?: string
          details?: string
          entity?: string
          entity_id?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string
          created_at?: string
          details?: string
          entity?: string
          entity_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      apps: {
        Row: {
          created_at: string
          description: string
          id: string
          logo_url: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          logo_url?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          logo_url?: string
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          app_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      category_fields: {
        Row: {
          app_id: string
          category_id: string
          created_at: string
          field_type: string
          id: string
          label: string
          options: Json
          required: boolean
        }
        Insert: {
          app_id: string
          category_id: string
          created_at?: string
          field_type?: string
          id?: string
          label: string
          options?: Json
          required?: boolean
        }
        Update: {
          app_id?: string
          category_id?: string
          created_at?: string
          field_type?: string
          id?: string
          label?: string
          options?: Json
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "category_fields_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_fields_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_app_fields: {
        Row: {
          app_id: string
          created_at: string
          field_type: string
          id: string
          label: string
          options: Json
          required: boolean
        }
        Insert: {
          app_id: string
          created_at?: string
          field_type?: string
          id?: string
          label: string
          options?: Json
          required?: boolean
        }
        Update: {
          app_id?: string
          created_at?: string
          field_type?: string
          id?: string
          label?: string
          options?: Json
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "custom_app_fields_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      global_fields: {
        Row: {
          created_at: string
          field_type: string
          id: string
          label: string
          options: Json
          required: boolean
        }
        Insert: {
          created_at?: string
          field_type?: string
          id?: string
          label: string
          options?: Json
          required?: boolean
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          label?: string
          options?: Json
          required?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          added_by: string
          app_id: string
          category_id: string
          created_at: string
          data: Json
          id: string
          images: Json
          price: number
          rejection_reason: string
          status: string
          title: string
          updated_at: string
          views: number
          wishlist_count: number
        }
        Insert: {
          added_by: string
          app_id: string
          category_id: string
          created_at?: string
          data?: Json
          id?: string
          images?: Json
          price?: number
          rejection_reason?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number
          wishlist_count?: number
        }
        Update: {
          added_by?: string
          app_id?: string
          category_id?: string
          created_at?: string
          data?: Json
          id?: string
          images?: Json
          price?: number
          rejection_reason?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number
          wishlist_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string
          created_at: string
          email: string
          id: string
          is_verified: boolean
          name: string
          phone: string
        }
        Insert: {
          avatar?: string
          created_at?: string
          email: string
          id: string
          is_verified?: boolean
          name?: string
          phone?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          email?: string
          id?: string
          is_verified?: boolean
          name?: string
          phone?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          product_id: string
          reason: string
          resolved: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          reason?: string
          resolved?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          reason?: string
          resolved?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "worker"
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
      app_role: ["user", "admin", "worker"],
    },
  },
} as const
