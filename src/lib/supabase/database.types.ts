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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'learner' | 'instructor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'learner' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'learner' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          thumbnail_url: string | null
          category: string
          level: 'beginner' | 'intermediate' | 'advanced'
          duration_weeks: number
          price: number
          is_active: boolean
          instructor_id: string | null
          course_type: 'self-paced' | 'instructor-led'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          thumbnail_url?: string | null
          category: string
          level: 'beginner' | 'intermediate' | 'advanced'
          duration_weeks: number
          price: number
          is_active?: boolean
          instructor_id?: string | null
          course_type: 'self-paced' | 'instructor-led'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          thumbnail_url?: string | null
          category?: string
          level?: 'beginner' | 'intermediate' | 'advanced'
          duration_weeks?: number
          price?: number
          is_active?: boolean
          instructor_id?: string | null
          course_type?: 'self-paced' | 'instructor-led'
          created_at?: string
          updated_at?: string
        }
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string
          content_type: 'text' | 'video' | 'quiz'
          video_url: string | null
          order_index: number
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content: string
          content_type: 'text' | 'video' | 'quiz'
          video_url?: string | null
          order_index: number
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content?: string
          content_type?: 'text' | 'video' | 'quiz'
          video_url?: string | null
          order_index?: number
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'active' | 'completed' | 'cancelled'
          progress_percentage: number
          enrolled_at: string
          completed_at: string | null
          payment_status: 'pending' | 'paid' | 'failed'
          payment_amount: number
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'active' | 'completed' | 'cancelled'
          progress_percentage?: number
          enrolled_at?: string
          completed_at?: string | null
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_amount: number
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'active' | 'completed' | 'cancelled'
          progress_percentage?: number
          enrolled_at?: string
          completed_at?: string | null
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_amount?: number
        }
      }
      assignments: {
        Row: {
          id: string
          course_id: string
          module_id: string | null
          title: string
          description: string
          due_date: string | null
          max_score: number
          submission_type: 'github' | 'google_docs' | 'text'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          module_id?: string | null
          title: string
          description: string
          due_date?: string | null
          max_score: number
          submission_type: 'github' | 'google_docs' | 'text'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          module_id?: string | null
          title?: string
          description?: string
          due_date?: string | null
          max_score?: number
          submission_type?: 'github' | 'google_docs' | 'text'
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          user_id: string
          submission_url: string
          submission_text: string | null
          submitted_at: string
          score: number | null
          ai_score: number | null
          ai_feedback: string | null
          instructor_feedback: string | null
          status: 'pending' | 'graded' | 'revision_needed'
          graded_by: string | null
          graded_at: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          user_id: string
          submission_url: string
          submission_text?: string | null
          submitted_at?: string
          score?: number | null
          ai_score?: number | null
          ai_feedback?: string | null
          instructor_feedback?: string | null
          status?: 'pending' | 'graded' | 'revision_needed'
          graded_by?: string | null
          graded_at?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          user_id?: string
          submission_url?: string
          submission_text?: string | null
          submitted_at?: string
          score?: number | null
          ai_score?: number | null
          ai_feedback?: string | null
          instructor_feedback?: string | null
          status?: 'pending' | 'graded' | 'revision_needed'
          graded_by?: string | null
          graded_at?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          certificate_url: string
          issued_at: string
          verification_code: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          certificate_url: string
          issued_at?: string
          verification_code: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          certificate_url?: string
          issued_at?: string
          verification_code?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          course_id: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          course_id?: string | null
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          course_id?: string | null
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          session_url: string
          scheduled_at: string
          duration_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          session_url: string
          scheduled_at: string
          duration_minutes: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          session_url?: string
          scheduled_at?: string
          duration_minutes?: number
          created_at?: string
        }
      }
      progress_tracking: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          time_spent_minutes: number
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
          time_spent_minutes?: number
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          time_spent_minutes?: number
        }
      }
      instructor_payments: {
        Row: {
          id: string
          instructor_id: string
          amount: number
          month: string
          status: 'pending' | 'paid' | 'cancelled'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          amount: number
          month: string
          status?: 'pending' | 'paid' | 'cancelled'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          amount?: number
          month?: string
          status?: 'pending' | 'paid' | 'cancelled'
          paid_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'learner' | 'instructor' | 'admin'
      course_level: 'beginner' | 'intermediate' | 'advanced'
      course_type: 'self-paced' | 'instructor-led'
      content_type: 'text' | 'video' | 'quiz'
      enrollment_status: 'active' | 'completed' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed'
      submission_type: 'github' | 'google_docs' | 'text'
      submission_status: 'pending' | 'graded' | 'revision_needed'
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed'
      priority_level: 'low' | 'medium' | 'high'
    }
  }
}
