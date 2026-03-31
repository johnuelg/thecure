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
      about_highlights: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_url: string | null
          date_obtained: string
          display_order: number | null
          id: string
          issuer: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          date_obtained?: string
          display_order?: number | null
          id?: string
          issuer: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          date_obtained?: string
          display_order?: number | null
          id?: string
          issuer?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          id: string
          last_message_at: string
          session_id: string
          started_at: string
        }
        Insert: {
          id?: string
          last_message_at?: string
          session_id: string
          started_at?: string
        }
        Update: {
          id?: string
          last_message_at?: string
          session_id?: string
          started_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      data_visualizations: {
        Row: {
          chart_config: Json | null
          chart_data: Json | null
          chart_type: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          media_url: string | null
          title: string
          updated_at: string
          visualization_type: string
        }
        Insert: {
          chart_config?: Json | null
          chart_data?: Json | null
          chart_type?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          media_url?: string | null
          title: string
          updated_at?: string
          visualization_type?: string
        }
        Update: {
          chart_config?: Json | null
          chart_data?: Json | null
          chart_type?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          media_url?: string | null
          title?: string
          updated_at?: string
          visualization_type?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          display_order: number | null
          id: string
          school: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          degree: string
          display_order?: number | null
          id?: string
          school: string
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          degree?: string
          display_order?: number | null
          id?: string
          school?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          period: string
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          period: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          period?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      expertise_tags: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string
          display_order: number | null
          group_name: string
          href: string
          id: string
          is_active: boolean | null
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          group_name: string
          href: string
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          group_name?: string
          href?: string
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_stats: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          is_active: boolean
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      knowledge_documents: {
        Row: {
          content: string
          created_at: string
          display_order: number
          document_type: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          document_type?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          document_type?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          about_description: string | null
          analytics_description: string | null
          bio: string | null
          brand_name: string | null
          brand_name_image_url: string | null
          contact_description: string | null
          copyright_text: string | null
          created_at: string
          email: string | null
          favicon_url: string | null
          footer_description: string | null
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          phone: string | null
          professional_title: string
          profile_image_url: string | null
          projects_description: string | null
          resume_description: string | null
          resume_url: string | null
          services_description: string | null
          site_description: string | null
          site_title: string | null
          tagline: string | null
          twitter_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          about_description?: string | null
          analytics_description?: string | null
          bio?: string | null
          brand_name?: string | null
          brand_name_image_url?: string | null
          contact_description?: string | null
          copyright_text?: string | null
          created_at?: string
          email?: string | null
          favicon_url?: string | null
          footer_description?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          professional_title?: string
          profile_image_url?: string | null
          projects_description?: string | null
          resume_description?: string | null
          resume_url?: string | null
          services_description?: string | null
          site_description?: string | null
          site_title?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          about_description?: string | null
          analytics_description?: string | null
          bio?: string | null
          brand_name?: string | null
          brand_name_image_url?: string | null
          contact_description?: string | null
          copyright_text?: string | null
          created_at?: string
          email?: string | null
          favicon_url?: string | null
          footer_description?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          professional_title?: string
          profile_image_url?: string | null
          projects_description?: string | null
          resume_description?: string | null
          resume_url?: string | null
          services_description?: string | null
          site_description?: string | null
          site_title?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          challenge: string | null
          created_at: string
          demo_url: string | null
          description: string
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          metrics: Json | null
          outcome: string | null
          solution: string | null
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          challenge?: string | null
          created_at?: string
          demo_url?: string | null
          description: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          metrics?: Json | null
          outcome?: string | null
          solution?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          challenge?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          metrics?: Json | null
          outcome?: string | null
          solution?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          level: number
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          level?: number
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_company: string | null
          author_image_url: string | null
          author_name: string
          author_title: string | null
          created_at: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          quote: string
          rating: number
        }
        Insert: {
          author_company?: string | null
          author_image_url?: string | null
          author_name: string
          author_title?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          quote: string
          rating?: number
        }
        Update: {
          author_company?: string | null
          author_image_url?: string | null
          author_name?: string
          author_title?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          quote?: string
          rating?: number
        }
        Relationships: []
      }
      tools: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
