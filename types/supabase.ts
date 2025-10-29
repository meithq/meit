/**
 * Supabase Database Types
 *
 * To generate this file automatically from your Supabase schema:
 * 1. Install supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Generate types: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 *
 * For now, this is a placeholder. Add your database types here or generate them.
 */

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
      // Add your table types here
      // Example:
      // users: {
      //   Row: {
      //     id: string
      //     email: string
      //     created_at: string
      //   }
      //   Insert: {
      //     id?: string
      //     email: string
      //     created_at?: string
      //   }
      //   Update: {
      //     id?: string
      //     email?: string
      //     created_at?: string
      //   }
      // }
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
  }
}
