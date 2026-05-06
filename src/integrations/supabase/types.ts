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
      allocation_logs: {
        Row: {
          action: string
          allocation_id: string | null
          created_at: string
          details: Json | null
          id: string
          performed_by: string
        }
        Insert: {
          action: string
          allocation_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
        }
        Update: {
          action?: string
          allocation_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocation_logs_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "tree_allocations"
            referencedColumns: ["id"]
          },
        ]
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
      campaigns: {
        Row: {
          allow_direct_payment: boolean
          allow_gift_card: boolean
          banner_image: string | null
          collected_amount: number
          created_at: string
          description: string
          end_date: string | null
          goal_amount: number
          id: string
          price_per_tree: number | null
          show_on_homepage: boolean
          sort_order: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          title: string
          updated_at: string
        }
        Insert: {
          allow_direct_payment?: boolean
          allow_gift_card?: boolean
          banner_image?: string | null
          collected_amount?: number
          created_at?: string
          description: string
          end_date?: string | null
          goal_amount?: number
          id?: string
          price_per_tree?: number | null
          show_on_homepage?: boolean
          sort_order?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title: string
          updated_at?: string
        }
        Update: {
          allow_direct_payment?: boolean
          allow_gift_card?: boolean
          banner_image?: string | null
          collected_amount?: number
          created_at?: string
          description?: string
          end_date?: string | null
          goal_amount?: number
          id?: string
          price_per_tree?: number | null
          show_on_homepage?: boolean
          sort_order?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      carbon_settings: {
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
      csr_partners: {
        Row: {
          budget_range: string | null
          company_name: string
          company_type: string
          contact_person: string
          created_at: string
          email: string
          id: string
          interest_area: string | null
          message: string | null
          notes: string | null
          phone: string
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          budget_range?: string | null
          company_name: string
          company_type?: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          interest_area?: string | null
          message?: string | null
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          budget_range?: string | null
          company_name?: string
          company_type?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          interest_area?: string | null
          message?: string | null
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          gift_card_id: string | null
          id: string
          notes: string | null
          payment_gateway: string | null
          payment_id: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          gift_card_id?: string | null
          id?: string
          notes?: string | null
          payment_gateway?: string | null
          payment_id?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          gift_card_id?: string | null
          id?: string
          notes?: string | null
          payment_gateway?: string | null
          payment_id?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      farmer_registrations: {
        Row: {
          consent: boolean
          created_at: string
          district: string
          full_name: string
          id: string
          interested_tree_types: string[] | null
          irrigation_available: boolean | null
          land_photo_url: string | null
          land_size_acres: number | null
          land_type: string | null
          mobile: string
          notes: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          village: string
        }
        Insert: {
          consent?: boolean
          created_at?: string
          district: string
          full_name: string
          id?: string
          interested_tree_types?: string[] | null
          irrigation_available?: boolean | null
          land_photo_url?: string | null
          land_size_acres?: number | null
          land_type?: string | null
          mobile: string
          notes?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          village: string
        }
        Update: {
          consent?: boolean
          created_at?: string
          district?: string
          full_name?: string
          id?: string
          interested_tree_types?: string[] | null
          irrigation_available?: boolean | null
          land_photo_url?: string | null
          land_size_acres?: number | null
          land_type?: string | null
          mobile?: string
          notes?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          village?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_external: boolean | null
          label: string
          label_hi: string | null
          section: string
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          label: string
          label_hi?: string | null
          section: string
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          label?: string
          label_hi?: string | null
          section?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      gift_card_page_content: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          link_text_en: string | null
          link_text_hi: string | null
          link_url: string | null
          section_key: string
          sort_order: number | null
          title_en: string | null
          title_hi: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          link_text_en?: string | null
          link_text_hi?: string | null
          link_url?: string | null
          section_key: string
          sort_order?: number | null
          title_en?: string | null
          title_hi?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          link_text_en?: string | null
          link_text_hi?: string | null
          link_url?: string | null
          section_key?: string
          sort_order?: number | null
          title_en?: string | null
          title_hi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gift_card_redemptions: {
        Row: {
          amount: number
          campaign_id: string
          donation_id: string | null
          gift_card_id: string
          id: string
          redeemed_at: string
          trees_planted: number | null
          user_id: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          donation_id?: string | null
          gift_card_id: string
          id?: string
          redeemed_at?: string
          trees_planted?: number | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          donation_id?: string | null
          gift_card_id?: string
          id?: string
          redeemed_at?: string
          trees_planted?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_redemptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_card_redemptions_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_card_redemptions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          balance: number
          code: string
          created_at: string
          expires_at: string
          gift_message: string | null
          id: string
          occasion: string | null
          payment_gateway: string | null
          payment_id: string | null
          purchaser_email: string | null
          purchaser_id: string | null
          purchaser_name: string | null
          recipient_email: string | null
          recipient_name: string | null
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          balance: number
          code: string
          created_at?: string
          expires_at?: string
          gift_message?: string | null
          id?: string
          occasion?: string | null
          payment_gateway?: string | null
          payment_id?: string | null
          purchaser_email?: string | null
          purchaser_id?: string | null
          purchaser_name?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          status?: string
          updated_at?: string
          value: number
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string
          expires_at?: string
          gift_message?: string | null
          id?: string
          occasion?: string | null
          payment_gateway?: string | null
          payment_id?: string | null
          purchaser_email?: string | null
          purchaser_id?: string | null
          purchaser_name?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          status?: string
          updated_at?: string
          value?: number
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
      land_partner_applications: {
        Row: {
          admin_notes: string | null
          consent: boolean
          created_at: string
          district: string
          full_name: string
          id: string
          irrigation_type: string
          land_photos: string[]
          land_size: number
          land_unit: string
          mobile: string
          ownership_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          village: string
        }
        Insert: {
          admin_notes?: string | null
          consent?: boolean
          created_at?: string
          district: string
          full_name: string
          id?: string
          irrigation_type?: string
          land_photos?: string[]
          land_size: number
          land_unit?: string
          mobile: string
          ownership_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          village: string
        }
        Update: {
          admin_notes?: string | null
          consent?: boolean
          created_at?: string
          district?: string
          full_name?: string
          id?: string
          irrigation_type?: string
          land_photos?: string[]
          land_size?: number
          land_unit?: string
          mobile?: string
          ownership_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          village?: string
        }
        Relationships: []
      }
      live_stats: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          sublabel: string | null
          suffix: string | null
          updated_at: string
          value: number
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          sublabel?: string | null
          suffix?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          sublabel?: string | null
          suffix?: string | null
          updated_at?: string
          value?: number
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
      navigation_items: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_visible_mobile: boolean | null
          label: string
          label_hi: string | null
          parent_id: string | null
          path: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_visible_mobile?: boolean | null
          label: string
          label_hi?: string | null
          parent_id?: string | null
          path: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_visible_mobile?: boolean | null
          label?: string
          label_hi?: string | null
          parent_id?: string | null
          path?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      nurseries: {
        Row: {
          contact_person: string
          created_at: string
          district: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: string
          name: string
          notes: string | null
          phone: string
          specialization: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          contact_person: string
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location: string
          name: string
          notes?: string | null
          phone: string
          specialization?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          contact_person?: string
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string
          name?: string
          notes?: string | null
          phone?: string
          specialization?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
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
      plant_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          plant_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          plant_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          plant_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_images_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
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
      plants: {
        Row: {
          care_level: string | null
          category: string
          category_hi: string | null
          created_at: string | null
          description: string
          description_hi: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          light_requirement: string | null
          name: string
          name_hi: string | null
          price: number
          scientific_name: string | null
          sort_order: number | null
          stock_quantity: number
          updated_at: string | null
          water_requirement: string | null
        }
        Insert: {
          care_level?: string | null
          category?: string
          category_hi?: string | null
          created_at?: string | null
          description: string
          description_hi?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          light_requirement?: string | null
          name: string
          name_hi?: string | null
          price: number
          scientific_name?: string | null
          sort_order?: number | null
          stock_quantity?: number
          updated_at?: string | null
          water_requirement?: string | null
        }
        Update: {
          care_level?: string | null
          category?: string
          category_hi?: string | null
          created_at?: string | null
          description?: string
          description_hi?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          light_requirement?: string | null
          name?: string
          name_hi?: string | null
          price?: number
          scientific_name?: string | null
          sort_order?: number | null
          stock_quantity?: number
          updated_at?: string | null
          water_requirement?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean
          full_name: string
          id: string
          phone: string | null
          referral_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean
          full_name: string
          id: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean
          full_name?: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_bonus: number
          referee_id: string
          referrer_bonus: number
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_bonus?: number
          referee_id: string
          referrer_bonus?: number
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_bonus?: number
          referee_id?: string
          referrer_bonus?: number
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scrap_request_items: {
        Row: {
          actual_qty_kg: number | null
          created_at: string
          estimated_qty_kg: number | null
          id: string
          line_total: number | null
          rate_at_collection: number | null
          request_id: string
          scrap_type_id: string
        }
        Insert: {
          actual_qty_kg?: number | null
          created_at?: string
          estimated_qty_kg?: number | null
          id?: string
          line_total?: number | null
          rate_at_collection?: number | null
          request_id: string
          scrap_type_id: string
        }
        Update: {
          actual_qty_kg?: number | null
          created_at?: string
          estimated_qty_kg?: number | null
          id?: string
          line_total?: number | null
          rate_at_collection?: number | null
          request_id?: string
          scrap_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrap_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "waste_management_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrap_request_items_scrap_type_id_fkey"
            columns: ["scrap_type_id"]
            isOneToOne: false
            referencedRelation: "scrap_types"
            referencedColumns: ["id"]
          },
        ]
      }
      scrap_types: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_hi: string | null
          rate_per_kg: number
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_hi?: string | null
          rate_per_kg?: number
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_hi?: string | null
          rate_per_kg?: number
          sort_order?: number
          unit?: string
          updated_at?: string
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
      site_visitors: {
        Row: {
          id: string
          page_path: string | null
          visited_at: string
          visitor_id: string
        }
        Insert: {
          id?: string
          page_path?: string | null
          visited_at?: string
          visitor_id: string
        }
        Update: {
          id?: string
          page_path?: string | null
          visited_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      survival_updates: {
        Row: {
          created_at: string
          health_status: string
          height_cm: number | null
          id: string
          notes: string | null
          order_id: string | null
          photo_url: string | null
          request_id: string | null
          update_date: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          health_status?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          photo_url?: string | null
          request_id?: string | null
          update_date?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          health_status?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          photo_url?: string | null
          request_id?: string | null
          update_date?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "survival_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survival_updates_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "tree_plantation_requests"
            referencedColumns: ["id"]
          },
        ]
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
      tree_allocations: {
        Row: {
          allocated_by: string
          application_id: string
          batch_id: string | null
          created_at: string
          id: string
          incentive_per_tree: number
          notes: string | null
          order_id: string | null
          partner_id: string
          payout_amount: number | null
          payout_date: string | null
          payout_reference: string | null
          payout_status: string
          plantation_date: string
          review_date: string | null
          species: string
          status: string
          tree_count: number
          trees_alive: number | null
          trees_dead: number | null
          updated_at: string
        }
        Insert: {
          allocated_by: string
          application_id: string
          batch_id?: string | null
          created_at?: string
          id?: string
          incentive_per_tree?: number
          notes?: string | null
          order_id?: string | null
          partner_id: string
          payout_amount?: number | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string
          plantation_date: string
          review_date?: string | null
          species: string
          status?: string
          tree_count: number
          trees_alive?: number | null
          trees_dead?: number | null
          updated_at?: string
        }
        Update: {
          allocated_by?: string
          application_id?: string
          batch_id?: string | null
          created_at?: string
          id?: string
          incentive_per_tree?: number
          notes?: string | null
          order_id?: string | null
          partner_id?: string
          payout_amount?: number | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string
          plantation_date?: string
          review_date?: string | null
          species?: string
          status?: string
          tree_count?: number
          trees_alive?: number | null
          trees_dead?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_allocations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "land_partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tree_allocations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      villages: {
        Row: {
          approved_at: string | null
          block: string | null
          contact_person: string
          created_at: string
          current_tree_count: number | null
          district: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          population: number | null
          registered_at: string
          state: string
          status: string
          trees_requested: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          block?: string | null
          contact_person: string
          created_at?: string
          current_tree_count?: number | null
          district: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          population?: number | null
          registered_at?: string
          state?: string
          status?: string
          trees_requested?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          block?: string | null
          contact_person?: string
          created_at?: string
          current_tree_count?: number | null
          district?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          population?: number | null
          registered_at?: string
          state?: string
          status?: string
          trees_requested?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          source: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          source: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          source?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
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
      generate_gift_card_code: { Args: never; Returns: string }
      generate_marketplace_order_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      generate_tracking_id: { Args: never; Returns: string }
      generate_waste_tracking_id: { Args: never; Returns: string }
      get_visitor_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_views: { Args: { post_id: string }; Returns: undefined }
      record_visit: {
        Args: { p_page_path?: string; p_visitor_id: string }
        Returns: undefined
      }
      validate_gift_card_code: {
        Args: { p_code: string }
        Returns: {
          balance: number
          expires_at: string
          id: string
          status: string
        }[]
      }
      wallet_transaction: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_source: string
          p_type: string
          p_user_id: string
        }
        Returns: {
          new_balance: number
          transaction_id: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "land_partner"
        | "verified_land_partner"
        | "scrap_vendor"
      campaign_status: "ACTIVE" | "INACTIVE" | "COMPLETED"
      marketplace_category:
        | "farmer_produce"
        | "value_added"
        | "plants_gardening"
        | "home_utility"
      payment_mode: "DIRECT" | "GIFT_CARD"
      payment_status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
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
      app_role: [
        "admin",
        "user",
        "land_partner",
        "verified_land_partner",
        "scrap_vendor",
      ],
      campaign_status: ["ACTIVE", "INACTIVE", "COMPLETED"],
      marketplace_category: [
        "farmer_produce",
        "value_added",
        "plants_gardening",
        "home_utility",
      ],
      payment_mode: ["DIRECT", "GIFT_CARD"],
      payment_status: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
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
