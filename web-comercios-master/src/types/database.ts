// Database entity types for MEIT platform
// Based on Supabase schema

export interface Customer {
  id: string
  phone: string
  name: string
  email?: string | null
  total_points: number
  visit_count: number
  last_visit: string | null
  created_at: string
  updated_at: string
}

export interface Challenge {
  id: string
  merchant_id: string
  name: string
  description?: string | null
  type: 'amount_min' | 'time_based' | 'frequency' | 'category'
  points: number
  target_value?: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Merchant {
  id: string
  name: string
  business_category?: string | null
  phone?: string | null
  email?: string | null
  points_per_bs: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  merchant_id: string
  auth_user_id: string
  name: string
  email: string
  role: 'admin' | 'operator'
  last_login?: string | null
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  merchant_id: string
  name: string
  address?: string | null
  qr_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  customer_id: string
  merchant_id: string
  branch_id: string
  points_earned: number
  checked_in_at: string
  created_at: string
}

export interface PointTransaction {
  id: string
  customer_id: string
  merchant_id: string
  points: number
  type: 'earn' | 'redeem' | 'adjustment'
  description?: string | null
  reference_id?: string | null
  created_at: string
}

export interface GiftCard {
  id: string
  merchant_id: string
  customer_id?: string | null
  code: string
  points_cost: number
  value: number
  status: 'available' | 'redeemed' | 'expired'
  redeemed_at?: string | null
  expires_at?: string | null
  created_at: string
  updated_at: string
}

export interface CustomerMerchant {
  customer_id: string
  merchant_id: string
  first_visit: string
  last_visit: string | null
  total_visits: number
  total_points: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  merchant_id: string
  user_id?: string | null
  action: string
  entity_type: string
  entity_id?: string | null
  changes?: Record<string, unknown> | null
  created_at: string
}

export interface WhatsAppMessage {
  id: string
  customer_id?: string | null
  merchant_id?: string | null
  phone_number: string
  message_content: string
  message_type: 'inbound' | 'outbound' | 'checkin_confirmation' | 'points_earned' | 'gift_card_generated'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'received'
  external_id?: string | null
  error_message?: string | null
  retry_count: number
  created_at: string
  updated_at: string
}

// Joined types for common queries
export interface UserWithMerchant extends User {
  merchant: Merchant
}

export interface CustomerWithStats extends Customer {
  redeemable_gift_cards: number
  pending_challenges: number
}

export interface CheckInWithDetails extends CheckIn {
  customer: Pick<Customer, 'id' | 'name' | 'phone'>
  branch: Pick<Branch, 'id' | 'name'>
}

// Dashboard metrics type
export interface DashboardMetrics {
  today_visits: number
  today_points: number
  active_customers: number
  active_challenges: number
  total_customers: number
  total_points_distributed: number
}

// Filter and pagination types
export interface CustomerFilters {
  search?: string
  sort_by?: 'name' | 'points' | 'last_visit'
  sort_order?: 'asc' | 'desc'
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

// DTO types for create/update operations
export interface CreateCustomerDto {
  phone: string
  name: string
  email?: string
}

export interface UpdateCustomerDto {
  name?: string
  email?: string
  total_points?: number
}

export interface CreateChallengeDto {
  name: string
  description?: string
  type: 'amount_min' | 'time_based' | 'frequency' | 'category'
  points: number
  target_value?: number
  is_active?: boolean
}

export interface UpdateChallengeDto {
  name?: string
  description?: string
  points?: number
  target_value?: number
  is_active?: boolean
}

export interface CreateGiftCardDto {
  customer_id: string
  points_cost: number
  value: number
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: Pagination
}
