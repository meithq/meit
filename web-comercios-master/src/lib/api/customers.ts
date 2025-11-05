import { supabase } from '@/lib/supabase';
import type { CreateCustomerDto } from '@/types/database';
import type { CustomerFilters, CustomerSort } from '@/types/customer';
import { PAGINATION } from '@/lib/constants';

/**
 * Fetch customers with filters and pagination
 * Exported for reuse in hooks and prefetching
 */
export async function fetchCustomers(
  merchantId: string,
  filters?: CustomerFilters,
  sort?: CustomerSort,
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT
) {
  // Build query
  let query = supabase
    .from('customers')
    .select(
      `
      *,
      customer_merchants!inner(
        merchant_id,
        total_points,
        total_visits,
        last_visit
      )
    `,
      { count: 'exact' }
    )
    .eq('customer_merchants.merchant_id', merchantId)
    .eq('customer_merchants.is_active', true);

  // Apply search filter
  if (filters?.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.trim();
    query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
  }

  // Apply points range filter
  if (filters?.minPoints !== null && filters?.minPoints !== undefined) {
    query = query.gte('customer_merchants.total_points', filters.minPoints);
  }
  if (filters?.maxPoints !== null && filters?.maxPoints !== undefined) {
    query = query.lte('customer_merchants.total_points', filters.maxPoints);
  }

  // Apply date range filter
  if (filters?.dateFrom) {
    query = query.gte('customer_merchants.last_visit', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('customer_merchants.last_visit', filters.dateTo);
  }

  // Apply sorting
  if (sort) {
    // Map sort field to query path
    const sortField =
      sort.field === 'total_points' || sort.field === 'visit_count' || sort.field === 'last_visit'
        ? `customer_merchants.${sort.field === 'visit_count' ? 'total_visits' : sort.field}`
        : sort.field;

    query = query.order(sortField, { ascending: sort.order === 'asc' });
  } else {
    query = query.order('customer_merchants.last_visit', { ascending: false, nullsFirst: false });
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    customers: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Search customer by phone
 * Exported for reuse in hooks and prefetching
 */
export async function searchCustomerByPhone(merchantId: string, phone: string) {
  const { data, error } = await supabase
    .from('customers')
    .select(
      `
      *,
      customer_merchants!inner(
        merchant_id,
        total_points,
        total_visits,
        last_visit
      )
    `
    )
    .eq('customer_merchants.merchant_id', merchantId)
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new customer
 */
export async function createCustomer(merchantId: string, data: CreateCustomerDto) {
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
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  // Create customer-merchant relationship
  const { error: relationError } = await supabase.from('customer_merchants').insert({
    customer_id: newCustomer.id,
    merchant_id: merchantId,
    first_visit: new Date().toISOString(),
    total_visits: 0,
    total_points: 0,
    is_active: true,
  });

  if (relationError) {
    console.error('Error creating customer-merchant relationship:', relationError);
    // Customer created but relationship failed
    // Will be created during first check-in
  }

  return newCustomer;
}
