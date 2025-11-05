import { create } from 'zustand'
import type { Customer, CustomerFilters, Pagination } from '@/types/database'
import { PAGINATION, SORT_ORDER } from '@/lib/constants'

interface CustomersState {
  customers: Customer[]
  loading: boolean
  filters: {
    search: string
    sort_by: 'name' | 'points' | 'last_visit'
    sort_order: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

interface CustomersActions {
  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  setFilters: (filters: Partial<CustomerFilters>) => void
  setPagination: (pagination: Partial<Pagination>) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

type CustomersStore = CustomersState & CustomersActions

const initialState: CustomersState = {
  customers: [],
  loading: false,
  filters: {
    search: '',
    sort_by: 'name',
    sort_order: SORT_ORDER.ASC as 'asc',
  },
  pagination: {
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    total: 0,
  },
}

/**
 * Customers store using Zustand
 *
 * Manages customer list state, filters, and pagination
 *
 * Usage:
 * ```typescript
 * const { customers, loading, setCustomers, setFilters } = useCustomersStore()
 * ```
 */
export const useCustomersStore = create<CustomersStore>((set) => ({
  ...initialState,

  setCustomers: (customers) => {
    set({ customers })
  },

  addCustomer: (customer) => {
    set((state) => ({
      customers: [customer, ...state.customers],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }))
  },

  updateCustomer: (id, data) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, ...data } : customer
      ),
    }))
  },

  removeCustomer: (id) => {
    set((state) => ({
      customers: state.customers.filter((customer) => customer.id !== id),
      pagination: {
        ...state.pagination,
        total: Math.max(0, state.pagination.total - 1),
      },
    }))
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      // Reset to first page when filters change
      pagination: { ...state.pagination, page: PAGINATION.DEFAULT_PAGE },
    }))
  },

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }))
  },

  setLoading: (loading) => {
    set({ loading })
  },

  reset: () => {
    set(initialState)
  },
}))
