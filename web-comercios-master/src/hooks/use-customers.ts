'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/database'
import type { CustomerFilters, CustomerSort, CustomerPagination } from '@/types/customer'
import { PAGINATION } from '@/lib/constants'

// Use CustomerFilters directly since it already extends with the necessary fields
type AdvancedFilters = CustomerFilters

/**
 * Customers hook
 *
 * Provides CRUD operations for customers with advanced filtering and pagination
 *
 * Usage:
 * ```typescript
 * const { customers, loading, error, fetchCustomers, createCustomer, updateCustomer } = useCustomers()
 * ```
 */
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<CustomerPagination | null>(null)
  const merchantId = useAuthStore((state) => state.merchantId)

  /**
   * Fetch customers with optional filters and pagination
   */
  const fetchCustomers = useCallback(async (
    filters?: AdvancedFilters,
    sort?: CustomerSort,
    paginationOptions?: { page: number; limit: number }
  ) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const page = paginationOptions?.page || PAGINATION.DEFAULT_PAGE
      const limit = paginationOptions?.limit || PAGINATION.DEFAULT_LIMIT

      // Use customer_merchants relationship table for many-to-many filtering
      let query = supabase
        .from('customers')
        .select(`
          *,
          customer_merchants!inner(
            merchant_id,
            total_points,
            total_visits,
            last_visit
          )
        `, { count: 'exact' })
        .eq('customer_merchants.merchant_id', merchantId)
        .eq('customer_merchants.is_active', true)

      // Apply search filter (name or phone)
      if (filters?.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.trim()
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }

      // Apply points range filter
      if (filters?.minPoints !== null && filters?.minPoints !== undefined) {
        query = query.gte('total_points', filters.minPoints)
      }
      if (filters?.maxPoints !== null && filters?.maxPoints !== undefined) {
        query = query.lte('total_points', filters.maxPoints)
      }

      // Apply date range filter (last visit)
      if (filters?.dateFrom) {
        query = query.gte('last_visit', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('last_visit', filters.dateTo)
      }

      // Note: status filter removed as customers table doesn't have status field

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.order === 'asc' })
      } else {
        query = query.order('last_visit', { ascending: false, nullsFirst: false })
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        console.error('Error fetching customers:', fetchError)
        setError(fetchError.message)
        return
      }

      setCustomers(data || [])

      // Update pagination info
      if (count !== null) {
        setPagination({
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        })
      }
    } catch (err) {
      console.error('Error in fetchCustomers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Create a new customer and establish merchant relationship
   */
  const createCustomer = useCallback(async (data: CreateCustomerDto) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // First, create the customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          phone: data.phone,
          name: data.name,
          email: data.email || null,
          total_points: 0,
          visit_count: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating customer:', createError)
        setError(createError.message)
        return null
      }

      // Create customer-merchant relationship
      const { error: relationError } = await supabase
        .from('customer_merchants')
        .insert({
          customer_id: newCustomer.id,
          merchant_id: merchantId,
          first_visit: new Date().toISOString(),
          total_visits: 0,
          total_points: 0,
          is_active: true,
        })

      if (relationError) {
        console.error('Error creating customer-merchant relationship:', relationError)
        // Customer created but relationship failed - still return customer
        // The relationship can be created later during check-in
      }

      // Add to local state
      setCustomers((prev) => [newCustomer, ...prev])

      return newCustomer
    } catch (err) {
      console.error('Error in createCustomer:', err)
      setError(err instanceof Error ? err.message : 'Failed to create customer')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Update an existing customer
   */
  const updateCustomer = useCallback(async (id: string, data: UpdateCustomerDto) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
          name: data.name,
          email: data.email,
          total_points: data.total_points,
        })
        .eq('id', id)
        .eq('merchant_id', merchantId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating customer:', updateError)
        setError(updateError.message)
        return null
      }

      // Update local state
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === id ? updatedCustomer : customer))
      )

      return updatedCustomer
    } catch (err) {
      console.error('Error in updateCustomer:', err)
      setError(err instanceof Error ? err.message : 'Failed to update customer')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Get customer by ID
   */
  const getCustomerById = useCallback(async (id: string) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('merchant_id', merchantId)
        .single()

      if (fetchError) {
        console.error('Error fetching customer:', fetchError)
        setError(fetchError.message)
        return null
      }

      return customer
    } catch (err) {
      console.error('Error in getCustomerById:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customer')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Search customers by phone (within merchant's customers)
   */
  const searchByPhone = useCallback(async (phone: string) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data: customer, error: searchError } = await supabase
        .from('customers')
        .select(`
          *,
          customer_merchants!inner(
            merchant_id,
            total_points,
            total_visits,
            last_visit
          )
        `)
        .eq('customer_merchants.merchant_id', merchantId)
        .eq('phone', phone)
        .maybeSingle()

      if (searchError) {
        console.error('Error searching customer:', searchError)
        setError(searchError.message)
        return null
      }

      return customer
    } catch (err) {
      console.error('Error in searchByPhone:', err)
      setError(err instanceof Error ? err.message : 'Failed to search customer')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    getCustomerById,
    searchByPhone,
  }
}
