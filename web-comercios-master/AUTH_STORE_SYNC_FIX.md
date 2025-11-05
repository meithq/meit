# Auth Store Synchronization Fix

## Problem
The application was experiencing "No merchant ID found" errors because the `AuthContext` successfully authenticated users but never updated the Zustand `auth-store`, leaving `merchantId` as `null` for all pages.

## Root Cause
- `AuthContext` managed authentication state locally but didn't sync with the persistent `auth-store`
- Pages relied on the `auth-store` for `merchantId` access
- The store remained empty even after successful authentication

## Changes Made

### 1. Updated `auth-store.ts`
**File:** `apps/web-comercios/src/store/auth-store.ts`

#### Added `merchant` to state interface
```typescript
interface AuthState {
  user: User | null
  merchantId: string | null
  merchant: Merchant | null  // NEW
  role: 'admin' | 'operator' | null
  loading: boolean
}
```

#### Updated `setMerchantData` signature
```typescript
interface AuthActions {
  setMerchantData: (merchantId: string, role: 'admin' | 'operator', merchant: Merchant | null) => void
}
```

#### Updated implementation
```typescript
setMerchantData: (merchantId, role, merchant) => {
  set({ merchantId, role, merchant })
}
```

#### Updated persistence
```typescript
partialize: (state) => ({
  user: state.user,
  merchantId: state.merchantId,
  merchant: state.merchant,  // NEW
  role: state.role,
})
```

### 2. Updated `AuthContext.tsx`
**File:** `apps/web-comercios/src/contexts/AuthContext.tsx`

#### Added store import
```typescript
import { useAuthStore } from '@/store/auth-store';
```

#### Added sync in `loadUser()` function
After successfully loading a user, the context now syncs with the store:

```typescript
if (currentUser) {
  // ... existing logging code ...

  // Sync with auth-store
  const { setUser: setStoreUser, setMerchantData } = useAuthStore.getState();

  // Map UserWithMerchant to local User type for store
  const userForStore = {
    id: currentUser.id,
    merchant_id: currentUser.merchant_id || '',
    auth_user_id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    last_login: currentUser.last_login,
    created_at: currentUser.created_at,
    updated_at: currentUser.updated_at,
  };

  setStoreUser(userForStore);
  setMerchantData(
    currentUser.merchant_id || '',
    currentUser.role,
    currentUser.merchant || null
  );
}
```

#### Added store clear in `signOut()` function
```typescript
const signOut = async () => {
  try {
    // ... existing code ...
    setUser(null);

    // Clear auth-store
    const { logout: logoutStore } = useAuthStore.getState();
    logoutStore();

    // ... rest of code ...
  }
}
```

#### Added store clear in `SIGNED_OUT` event
```typescript
if (event === 'SIGNED_OUT') {
  setUser(null);
  setLoading(false);
  isLoadingRef.current = false;

  // Clear auth-store
  const { logout: logoutStore } = useAuthStore.getState();
  logoutStore();
}
```

## Result
- ✅ `AuthContext` now properly syncs user data to `auth-store` after authentication
- ✅ `merchantId` is available in the store for all pages to use
- ✅ `merchant` object is also stored for direct access
- ✅ Store is cleared on sign out and session end
- ✅ Type-safe implementation without `any` casts
- ✅ All changes are minimal and focused on the synchronization issue

## Testing
After these changes:
1. Login populates `merchantId` in the store ✅
2. Pages can access `merchantId` and `merchant` from the store ✅
3. Data persists in localStorage ✅
4. Store is cleared on logout ✅
5. TypeScript compilation passes ✅

## Files Modified
- `apps/web-comercios/src/store/auth-store.ts`
- `apps/web-comercios/src/contexts/AuthContext.tsx`

## No Breaking Changes
- Existing functionality preserved
- Both AuthContext and store continue to work as before
- Only added synchronization between them
- No architectural changes required
