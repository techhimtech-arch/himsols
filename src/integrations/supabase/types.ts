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
      activities: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean | null
          location: string
          sort_order: number | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          location: string
          sort_order?: number | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          location?: string
          sort_order?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          content_hi: string | null
          cover_image: string | null
          created_at: string
          excerpt: string
          excerpt_hi: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          title_hi: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          content_hi?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt: string
          excerpt_hi?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          title_hi?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          content_hi?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          excerpt_hi?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          title_hi?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          subject?: string
        }
        Relationships: []
      }
      corporate_benefits: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      corporate_clients: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      corporate_packages: {
        Row: {
          created_at: string | null
          description: string
          features: string[] | null
          id: string
          is_active: boolean | null
          is_highlighted: boolean | null
          name: string
          period: string
          price: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          name: string
          period: string
          price: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          name?: string
          period?: string
          price?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      corporate_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      corporate_solutions: {
        Row: {
          created_at: string | null
          description: string
          features: string[] | null
          icon: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          features?: string[] | null
          icon: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          features?: string[] | null
          icon?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      corporate_stats: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      corporate_testimonials: {
        Row: {
          company: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          quote: string
          role: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          quote: string
          role: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          quote?: string
          role?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      external_apps: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      homepage_items: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link: string | null
          section_key: string
          sort_order: number | null
          title_en: string
          title_hi: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          section_key: string
          sort_order?: number | null
          title_en: string
          title_hi?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          section_key?: string
          sort_order?: number | null
          title_en?: string
          title_hi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          background_image: string | null
          content_en: string | null
          content_hi: string | null
          created_at: string | null
          cta_link: string | null
          cta_text_en: string | null
          cta_text_hi: string | null
          id: string
          is_active: boolean | null
          section_key: string
          sort_order: number | null
          subtitle_en: string | null
          subtitle_hi: string | null
          title_en: string | null
          title_hi: string | null
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          content_en?: string | null
          content_hi?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text_en?: string | null
          cta_text_hi?: string | null
          id?: string
          is_active?: boolean | null
          section_key: string
          sort_order?: number | null
          subtitle_en?: string | null
          subtitle_hi?: string | null
          title_en?: string | null
          title_hi?: string | null
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          content_en?: string | null
          content_hi?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text_en?: string | null
          cta_text_hi?: string | null
          id?: string
          is_active?: boolean | null
          section_key?: string
          sort_order?: number | null
          subtitle_en?: string | null
          subtitle_hi?: string | null
          title_en?: string | null
          title_hi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          created_at: string
          delivery_address: string
          district: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          state: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          district?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          district?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          category: Database["public"]["Enums"]["marketplace_category"]
          created_at: string
          delivery_timeline: string | null
          description: string
          description_hi: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_seasonal: boolean | null
          name: string
          name_hi: string | null
          origin_location: string | null
          price: number
          seller_id: string | null
          sort_order: number | null
          stock_quantity: number
          subcategory: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["marketplace_category"]
          created_at?: string
          delivery_timeline?: string | null
          description: string
          description_hi?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_seasonal?: boolean | null
          name: string
          name_hi?: string | null
          origin_location?: string | null
          price: number
          seller_id?: string | null
          sort_order?: number | null
          stock_quantity?: number
          subcategory?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["marketplace_category"]
          created_at?: string
          delivery_timeline?: string | null
          description?: string
          description_hi?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_seasonal?: boolean | null
          name?: string
          name_hi?: string | null
          origin_location?: string | null
          price?: number
          seller_id?: string | null
          sort_order?: number | null
          stock_quantity?: number
          subcategory?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_location: string
          district: string | null
          id: string
          notes: string | null
          quantity: number
          state: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          total_price: number
          tree_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_location: string
          district?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          total_price: number
          tree_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivery_location?: string
          district?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          total_price?: number
          tree_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "trees"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_types: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      plantation_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          order_id: string | null
          photo_url: string
          request_id: string | null
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_id?: string | null
          photo_url: string
          request_id?: string | null
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_id?: string | null
          photo_url?: string
          request_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantation_photos_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantation_photos_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "tree_plantation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sellers: {
        Row: {
          avatar_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          region: string | null
          updated_at: string
          village: string
        }
        Insert: {
          avatar_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region?: string | null
          updated_at?: string
          village: string
        }
        Update: {
          avatar_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region?: string | null
          updated_at?: string
          village?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          is_active: boolean | null
          location: string
          name: string
          quote: string
          rating: number | null
          role: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          quote: string
          rating?: number | null
          role: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          quote?: string
          rating?: number | null
          role?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tree_plantation_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          message: string | null
          name: string
          phone: string
          quantity: number
          status: Database["public"]["Enums"]["request_status"] | null
          tracking_id: string
          tree_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          message?: string | null
          name: string
          phone: string
          quantity: number
          status?: Database["public"]["Enums"]["request_status"] | null
          tracking_id: string
          tree_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          message?: string | null
          name?: string
          phone?: string
          quantity?: number
          status?: Database["public"]["Enums"]["request_status"] | null
          tracking_id?: string
          tree_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_plantation_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trees: {
        Row: {
          category: string
          category_hi: string | null
          created_at: string | null
          description: string
          description_hi: string | null
          growth_rate: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          max_height: string | null
          name: string
          name_hi: string | null
          price: number
          scientific_name: string | null
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          category: string
          category_hi?: string | null
          created_at?: string | null
          description: string
          description_hi?: string | null
          growth_rate?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_height?: string | null
          name: string
          name_hi?: string | null
          price: number
          scientific_name?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          category_hi?: string | null
          created_at?: string | null
          description?: string
          description_hi?: string | null
          growth_rate?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_height?: string | null
          name?: string
          name_hi?: string | null
          price?: number
          scientific_name?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          district: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          state: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          district?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          district?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waste_management_requests: {
        Row: {
          address: string
          created_at: string | null
          district: string | null
          email: string
          estimated_quantity: string | null
          id: string
          message: string | null
          name: string
          phone: string
          pickup_date: string
          state: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          tracking_id: string
          updated_at: string | null
          user_id: string
          waste_type: string
        }
        Insert: {
          address: string
          created_at?: string | null
          district?: string | null
          email: string
          estimated_quantity?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          pickup_date: string
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          tracking_id: string
          updated_at?: string | null
          user_id: string
          waste_type: string
        }
        Update: {
          address?: string
          created_at?: string | null
          district?: string | null
          email?: string
          estimated_quantity?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          pickup_date?: string
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          tracking_id?: string
          updated_at?: string | null
          user_id?: string
          waste_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_marketplace_order_number: { Args: never; Returns: string }
      generate_tracking_id: { Args: never; Returns: string }
      generate_waste_tracking_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      marketplace_category:
        | "farmer_produce"
        | "value_added"
        | "plants_gardening"
        | "home_utility"
      request_status:
        | "pending"
        | "site_verified"
        | "saplings_arranged"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      app_role: ["admin", "user"],
      marketplace_category: [
        "farmer_produce",
        "value_added",
        "plants_gardening",
        "home_utility",
      ],
      request_status: [
        "pending",
        "site_verified",
        "saplings_arranged",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
