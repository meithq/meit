'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { queryKeys, invalidateQueries } from '@/lib/react-query';
import { PAGINATION } from '@/lib/constants';
import type { CreateCustomerDto, UpdateCustomerDto } from '@/types/database';
import type { CustomerFilters, CustomerSort } from '@/types/customer';
import { fetchCustomers, searchCustomerByPhone, createCustomer } from '@/lib/api/customers';

/**
 * Hook to fetch customers list with caching and optimistic UI
 * Uses global staleTime (5 seconds) for consistent caching
 */
export function useCustomers(
  filters?: CustomerFilters,
  sort?: CustomerSort,
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT
) {
  const merchantId = useAuthStore((state) => state.merchantId);

  // Create a stable cache key based on filters
  const filterKey = filters ? JSON.stringify(filters) : undefined;

  return useQuery({
    queryKey: queryKeys.customers.list(merchantId || '', filterKey),
    queryFn: () => fetchCustomers(merchantId!, filters, sort, page, limit),
    enabled: !!merchantId,
    // Uses global staleTime: 5s for fresher data
    placeholderData: keepPreviousData, // Show previous data while loading new data
  });
}

/**
 * Hook to search customer by phone
 * Uses global staleTime (5 seconds) for consistent caching
 */
export function useCustomerSearch(phone: string) {
  const merchantId = useAuthStore((state) => state.merchantId);

  return useQuery({
    queryKey: queryKeys.customers.search(merchantId || '', phone),
    queryFn: () => searchCustomerByPhone(merchantId!, phone),
    enabled: !!merchantId && phone.length >= 10, // Only search with valid phone
    // Uses global staleTime: 5s
  });
}

/**
 * Hook to create a customer with automatic cache invalidation
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const merchantId = useAuthStore((state) => state.merchantId);

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => createCustomer(merchantId!, data),
    onSuccess: () => {
      // Invalidate customers list to refetch
      invalidateQueries.customers(queryClient);
    },
  });
}

/**
 * Hook to update a customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const merchantId = useAuthStore((state) => state.merchantId);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerDto }) => {
      const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update({
          name: data.name,
          email: data.email,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return updatedCustomer;
    },
    onSuccess: (data) => {
      // Invalidate specific customer and list
      invalidateQueries.customer(queryClient, merchantId!, data.id);
      invalidateQueries.customers(queryClient);
    },
  });
}

