export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chatbot_config: {
        Row: {
          created_at: string | null
          id: string
          subtitle: string | null
          title: string | null
          updated_at: string | null
          user_repo_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_repo_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_repo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_config_user_repo_id_fkey"
            columns: ["user_repo_id"]
            isOneToOne: true
            referencedRelation: "user_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          created_at: string | null
          full_text: string
          id: string
          published_at: string
          title: string
          updated_at: string | null
          url: string
          user_repo_id: string
        }
        Insert: {
          created_at?: string | null
          full_text: string
          id?: string
          published_at: string
          title: string
          updated_at?: string | null
          url: string
          user_repo_id: string
        }
        Update: {
          created_at?: string | null
          full_text?: string
          id?: string
          published_at?: string
          title?: string
          updated_at?: string | null
          url?: string
          user_repo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_user_repo_id_fkey"
            columns: ["user_repo_id"]
            isOneToOne: false
            referencedRelation: "user_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          github_access_token: string | null
          github_avatar_url: string | null
          github_username: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          github_access_token?: string | null
          github_avatar_url?: string | null
          github_username?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          github_access_token?: string | null
          github_avatar_url?: string | null
          github_username?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          question: string
          updated_at: string | null
          user_repo_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question: string
          updated_at?: string | null
          user_repo_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          updated_at?: string | null
          user_repo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_user_repo_id_fkey"
            columns: ["user_repo_id"]
            isOneToOne: false
            referencedRelation: "user_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      repositories: {
        Row: {
          admin_id: string
          created_at: string | null
          description: string | null
          github_repo_name: string
          github_repo_url: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          description?: string | null
          github_repo_name: string
          github_repo_url: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          description?: string | null
          github_repo_name?: string
          github_repo_url?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repositories_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_repositories: {
        Row: {
          chatbot_name: string
          created_at: string | null
          github_repo_name: string
          github_repo_url: string
          id: string
          template_repo_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chatbot_name: string
          created_at?: string | null
          github_repo_name: string
          github_repo_url: string
          id?: string
          template_repo_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chatbot_name?: string
          created_at?: string | null
          github_repo_name?: string
          github_repo_url?: string
          id?: string
          template_repo_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_repositories_template_repo_id_fkey"
            columns: ["template_repo_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_repositories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
