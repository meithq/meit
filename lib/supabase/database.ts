import { createClient } from './client'
import type { Database } from '@/types/supabase'

/**
 * Generic query helper for Supabase tables
 * Provides type-safe CRUD operations
 */

export async function getAll<T>(table: keyof Database['public']['Tables']) {
  const supabase = createClient()

  const { data, error } = await supabase.from(table).select('*')

  if (error) {
    throw error
  }

  return data as T[]
}

export async function getById<T>(
  table: keyof Database['public']['Tables'],
  id: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data as T
}

export async function insert<T>(
  table: keyof Database['public']['Tables'],
  values: Partial<T>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(table)
    .insert(values as any)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as T
}

export async function update<T>(
  table: keyof Database['public']['Tables'],
  id: string,
  values: Partial<T>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(table)
    .update(values as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as T
}

export async function remove(
  table: keyof Database['public']['Tables'],
  id: string
) {
  const supabase = createClient()

  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) {
    throw error
  }
}

/**
 * Example custom queries for specific use cases
 */

// Get items with filters
export async function getFiltered<T>(
  table: keyof Database['public']['Tables'],
  column: string,
  value: any
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(column, value)

  if (error) {
    throw error
  }

  return data as T[]
}

// Get items with pagination
export async function getPaginated<T>(
  table: keyof Database['public']['Tables'],
  page: number = 1,
  pageSize: number = 10
) {
  const supabase = createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    data: data as T[],
    count,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  }
}

// Search items
export async function search<T>(
  table: keyof Database['public']['Tables'],
  column: string,
  query: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .ilike(column, `%${query}%`)

  if (error) {
    throw error
  }

  return data as T[]
}
