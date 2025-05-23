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
      about_sheikh: {
        Row: {
          contact_info: Json | null
          full_bio: string | null
          id: number
          profile_image_url: string | null
          short_bio: string | null
          updated_at: string
        }
        Insert: {
          contact_info?: Json | null
          full_bio?: string | null
          id?: number
          profile_image_url?: string | null
          short_bio?: string | null
          updated_at?: string
        }
        Update: {
          contact_info?: Json | null
          full_bio?: string | null
          id?: number
          profile_image_url?: string | null
          short_bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          date: string | null
          details: string | null
          id: number
          is_published: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
        }
        Insert: {
          created_at?: string
          date?: string | null
          details?: string | null
          id?: number
          is_published?: boolean
          link?: string | null
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Update: {
          created_at?: string
          date?: string | null
          details?: string | null
          id?: number
          is_published?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Relationships: []
      }
      books: {
        Row: {
          category_id: number | null
          course_id: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: number
          is_research: boolean | null
          is_transcript: boolean | null
          linked_lesson_id: number | null
          storage_path: string | null
          title: string
        }
        Insert: {
          category_id?: number | null
          course_id?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_research?: boolean | null
          is_transcript?: boolean | null
          linked_lesson_id?: number | null
          storage_path?: string | null
          title: string
        }
        Update: {
          category_id?: number | null
          course_id?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_research?: boolean | null
          is_transcript?: boolean | null
          linked_lesson_id?: number | null
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_books_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_books_course"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "study_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_books_linked_lesson"
            columns: ["linked_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          book_id: number | null
          content: string
          created_at: string
          id: number
          is_approved: boolean
          lesson_id: number | null
          parent_comment_id: number | null
          profile_id: string
          study_course_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: number | null
          content: string
          created_at?: string
          id?: never
          is_approved?: boolean
          lesson_id?: number | null
          parent_comment_id?: number | null
          profile_id: string
          study_course_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: number | null
          content?: string
          created_at?: string
          id?: never
          is_approved?: boolean
          lesson_id?: number | null
          parent_comment_id?: number | null
          profile_id?: string
          study_course_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_study_course_id_fkey"
            columns: ["study_course_id"]
            isOneToOne: false
            referencedRelation: "study_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_lesson_id"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: number
          enrolled_at: string | null
          last_accessed_lesson_id: number | null
          user_id: string
        }
        Insert: {
          course_id: number
          enrolled_at?: string | null
          last_accessed_lesson_id?: number | null
          user_id: string
        }
        Update: {
          course_id?: number
          enrolled_at?: string | null
          last_accessed_lesson_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_enrollments_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "study_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_enrollments_last_lesson"
            columns: ["last_accessed_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_enrollments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: number
          created_at: string | null
          description: string | null
          id: number
          module_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string | null
          description?: string | null
          id?: number
          module_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string | null
          description?: string | null
          id?: number
          module_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_course_modules_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "study_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          lesson_id: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          lesson_id: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          lesson_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_completions_lesson_id"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_completions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category_id: number | null
          course_id: number | null
          created_at: string | null
          description: string | null
          id: number
          lesson_order: number | null
          module_number: number | null
          title: string
          youtube_url: string | null
        }
        Insert: {
          category_id?: number | null
          course_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          lesson_order?: number | null
          module_number?: number | null
          title: string
          youtube_url?: string | null
        }
        Update: {
          category_id?: number | null
          course_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          lesson_order?: number | null
          module_number?: number | null
          title?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lessons_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "study_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          link: string | null
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          link?: string | null
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          link?: string | null
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comment_suspended_until: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_banned: boolean
          points: number
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comment_suspended_until?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_banned?: boolean
          points?: number
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comment_suspended_until?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean
          points?: number
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      question_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: number
          is_correct: boolean
          option_order: number | null
          option_text: string
          question_id: number
        }
        Insert: {
          id?: number
          is_correct?: boolean
          option_order?: number | null
          option_text: string
          question_id: number
        }
        Update: {
          id?: number
          is_correct?: boolean
          option_order?: number | null
          option_text?: string
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_question_options_question_id"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_to_sheikh: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          category_id: number | null
          id: number
          is_answered: boolean | null
          is_public: boolean | null
          question_text: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          category_id?: number | null
          id?: number
          is_answered?: boolean | null
          is_public?: boolean | null
          question_text?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          category_id?: number | null
          id?: number
          is_answered?: boolean | null
          is_public?: boolean | null
          question_text?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_to_sheikh_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_to_sheikh_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number
          grading_status: string
          id: number
          manual_score: number | null
          passed: boolean | null
          quiz_id: number
          score: number | null
          started_at: string
          submitted_at: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number
          grading_status?: string
          id?: number
          manual_score?: number | null
          passed?: boolean | null
          quiz_id: number
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempt_number?: number
          grading_status?: string
          id?: number
          manual_score?: number | null
          passed?: boolean | null
          quiz_id?: number
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_attempts_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quiz_attempts_quiz_id"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: number
          points: number
          question_order: number | null
          question_text: string
          quiz_id: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          points?: number
          question_order?: number | null
          question_text: string
          quiz_id: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          points?: number
          question_order?: number | null
          question_text?: string
          quiz_id?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_questions_quiz_id"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: number
          is_active: boolean
          lesson_id: number | null
          max_attempts: number | null
          module_number: number | null
          pass_mark_percentage: number
          time_limit_minutes: number | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          course_id?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          is_active?: boolean
          lesson_id?: number | null
          max_attempts?: number | null
          module_number?: number | null
          pass_mark_percentage?: number
          time_limit_minutes?: number | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          is_active?: boolean
          lesson_id?: number | null
          max_attempts?: number | null
          module_number?: number | null
          pass_mark_percentage?: number
          time_limit_minutes?: number | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quizzes_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "study_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quizzes_lesson_id"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          id: number
          related_id: number | null
          timestamp: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          id?: number
          related_id?: number | null
          timestamp?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          id?: number
          related_id?: number | null
          timestamp?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      study_courses: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          title: string
          youtube_playlist_url: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          title: string
          youtube_playlist_url?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          title?: string
          youtube_playlist_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_private_messages: {
        Row: {
          admin_read_reply: boolean | null
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          related_question_id: number | null
          source: string | null
          title: string
          user_id: string
          user_replied_at: string | null
          user_reply_text: string | null
        }
        Insert: {
          admin_read_reply?: boolean | null
          content: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          related_question_id?: number | null
          source?: string | null
          title: string
          user_id: string
          user_replied_at?: string | null
          user_reply_text?: string | null
        }
        Update: {
          admin_read_reply?: boolean | null
          content?: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          related_question_id?: number | null
          source?: string | null
          title?: string
          user_id?: string
          user_replied_at?: string | null
          user_reply_text?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_reply_count: {
        Args: { p_parent_id: number }
        Returns: number
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_banned: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_type: "lecture" | "announcement"
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
      announcement_type: ["lecture", "announcement"],
    },
  },
} as const
