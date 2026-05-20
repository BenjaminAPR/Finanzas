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
          id: string
          amount: number
          description: string
          category: string | null
          date: string
          paid_by: string
          split_type: string
          household_id: string
          bank_account_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          amount: number
          description: string
          category?: string | null
          date?: string
          paid_by: string
          split_type: string
          household_id: string
          bank_account_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          category?: string | null
          date?: string
          paid_by?: string
          split_type?: string
          household_id?: string
          bank_account_id?: string | null
          created_at?: string | null
        }
      }
      bank_accounts: {
        Row: {
          id: string
          name: string
          balance: number
          household_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          balance?: number
          household_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          balance?: number
          household_id?: string
          created_at?: string | null
        }
      }
      pending_bot_expenses: {
        Row: {
          id: string
          user_id: string
          amount: number | null
          description: string | null
          category: string | null
          split_type: string | null
          bank_account_id: string | null
          step: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount?: number | null
          description?: string | null
          category?: string | null
          split_type?: string | null
          bank_account_id?: string | null
          step?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number | null
          description?: string | null
          category?: string | null
          split_type?: string | null
          bank_account_id?: string | null
          step?: string
          created_at?: string | null
        }
      }
      households: {
        Row: {
          id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
        }
      }
      household_members: {
        Row: {
          user_id: string
          household_id: string
        }
        Insert: {
          user_id: string
          household_id: string
        }
        Update: {
          user_id?: string
          household_id?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          phone_number: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          phone_number?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          phone_number?: string | null
        }
      }
      savings_goals: {
        Row: {
          id: string
          name: string
          target_amount: number
          current_amount: number
          household_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          target_amount: number
          current_amount?: number
          household_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          household_id?: string
          created_at?: string | null
        }
      }
      savings_transactions: {
        Row: {
          id: string
          goal_id: string
          amount: number
          user_id: string
          date: string
        }
        Insert: {
          id?: string
          goal_id: string
          amount: number
          user_id: string
          date?: string
        }
        Update: {
          id?: string
          goal_id?: string
          amount?: number
          user_id?: string
          date?: string
        }
      }
    }
  }
}
