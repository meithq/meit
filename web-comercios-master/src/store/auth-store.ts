import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Merchant } from '@/types/database'
import { STORAGE_KEYS } from '@/lib/constants'

interface AuthState {
  user: User | null
  merchantId: string | null
  merchant: Merchant | null
  role: 'admin' | 'operator' | null
  loading: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setMerchantData: (merchantId: string, role: 'admin' | 'operator', merchant: Merchant | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  reset: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  merchantId: null,
  merchant: null,
  role: null,
  loading: false,
}

/**
 * Authentication store using Zustand
 *
 * Persisted to localStorage for session management
 *
 * Usage:
 * ```typescript
 * const { user, merchantId, role, setUser } = useAuthStore()
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => {
        set({ user })
      },

      setMerchantData: (merchantId, role, merchant) => {
        set({ merchantId, role, merchant })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      logout: () => {
        set(initialState)
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STATE,
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        merchantId: state.merchantId,
        merchant: state.merchant,
        role: state.role,
      }),
    }
  )
)
