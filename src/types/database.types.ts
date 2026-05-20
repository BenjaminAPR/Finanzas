export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string
          description: string
          household_id: string
          id: string
          paid_by: string
          split_type: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string
          description: string
          household_id: string
          id?: string
          paid_by: string
          split_type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string
          household_id?: string
          id?: string
          paid_by?: string
          split_type?: string
        }
      }
      household_members: {
        Row: {
          household_id: string
          user_id: string
        }
        Insert: {
          household_id: string
          user_id: string
        }
        Update: {
          household_id?: string
          user_id?: string
        }
      }
      households: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
      }
      users: {
        Row: {
          email: string
          id: string
          name: string | null
          phone_number: string | null
        }
        Insert: {
          email: string
          id: string
          name?: string | null
          phone_number?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          phone_number?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
