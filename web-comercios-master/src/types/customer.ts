/**
 * Customer types and interfaces for MEIT platform
 * Re-export from database.ts to avoid duplication
 */

import type { Customer as DbCustomer } from './database'

export type Customer = DbCustomer

export interface CustomerFilters {
  search: string
  minPoints?: number | null
  maxPoints?: number | null
  dateFrom?: string | null
  dateTo?: string | null
}

export interface CustomerSort {
  field: 'name' | 'total_points' | 'visit_count' | 'last_visit'
  order: 'asc' | 'desc'
}

export interface CustomerPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CustomerListResponse {
  customers: Customer[]
  pagination: CustomerPagination
}

export interface CustomerFormData {
  phone: string
  name: string
  email?: string
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  avgPoints: number
}

// Customer detail page types
export interface CustomerDetail extends Customer {
  email?: string | null
  createdAt: string
  stats: CustomerDetailStats
  transactions: Transaction[]
  giftCards: GiftCard[]
}

export interface CustomerDetailStats {
  totalPoints: number
  totalVisits: number
  totalSpent: number
  giftCardsGenerated: number
}

export interface Transaction {
  id: string
  customerId: string
  type: 'purchase' | 'gift_card_generated' | 'gift_card_redeemed' | 'points_adjustment'
  amount?: number
  points: number
  description: string
  createdAt: string
}

export interface GiftCard {
  id: string
  customerId: string
  code: string
  value: number
  status: 'available' | 'redeemed' | 'expired'
  expiresAt: string | null
  redeemedAt: string | null
  createdAt: string
}
