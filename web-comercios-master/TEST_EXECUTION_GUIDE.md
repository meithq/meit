# End-to-End Authentication Testing Guide
## Phase 4: Complete Login Flow Verification

**Project**: Meit! Loyalty Platform - Web Comercios
**Test Date**: 2025-10-08
**Dev Server**: http://localhost:3001
**Tester**: QA Engineer

---

## Executive Summary

This document provides comprehensive test scenarios to verify that all authentication fixes are working correctly:

- Phase 1: Diagnostic logging added
- Phase 2: Backend migrated from localStorage to cookies
- Phase 3: Navigation race conditions eliminated

### Critical Success Criteria

The implementation is considered SUCCESSFUL if:
- No redirect loops occur during login
- Session is stored in cookies (not localStorage)
- Page refresh maintains authentication
- Middleware correctly handles all route protection scenarios

---

## Pre-Test Setup

### 1. Verify Development Server

```bash
cd c:\Users\elegi\Documents\meit-ecosystem\apps\web-comercios
npm run dev
```

Server should be running on: **http://localhost:3001**

### 2. Prepare Browser DevTools

1. Open Chrome browser
2. Navigate to http://localhost:3001
3. Open DevTools (F12)
4. Switch to **Console** tab
5. Enable "Preserve log" checkbox (to keep logs across navigations)
6. Clear existing console logs

### 3. Create Test User (If Needed)

If you don't have a test account, register one first:
- Navigate to http://localhost:3001/register
- Fill in test data
- Complete registration

**Recommended Test Account:**
- Email: `test@meit.com`
- Password: `Test123!`
- Name: `Test User`
- Merchant: `Test Merchant`

---

## Test Scenarios

## Test 1: Complete Login Flow (CRITICAL)

**Priority**: P0 - Must Pass
**Estimated Time**: 3 minutes

### Objective
Verify that a user can successfully log in without encountering redirect loops.

### Pre-conditions
- User is logged out
- Browser cookies cleared (optional but recommended for first test)

### Test Steps

1. **Navigate to Login Page**
   ```
   URL: http://localhost:3001/login
   ```

2. **Enter Valid Credentials**
   - Email: `test@meit.com`
   - Password: `Test123!`

3. **Submit Form**
   - Click "Iniciar sesión" button
   - Observe console logs in DevTools

4. **Observe Behavior**
   - Watch for spinner on button
   - Monitor navigation
   - Check final destination

### Expected Console Log Sequence

```
[LoginPage] onSubmit: form submitted
  email: "test@meit.com"
  timestamp: "2025-10-08T..."

[LoginPage] onSubmit: isLoading set to true, calling signIn

[AuthContext] signIn started
  email: "test@meit.com"

[AuthContext] signIn: calling loginMutation

[mutations/auth] login: started
  email: "test@meit.com"

[mutations/auth] login: calling signInWithPassword

[mutations/auth] login: succeeded
  userId: "..."
  email: "test@meit.com"
  hasSession: true
  elapsed: "...ms"

[AuthContext] signIn completed successfully
  userId: "..."
  elapsed: "...ms"

[AuthContext] signIn: loading state reset to false

[LoginPage] onSubmit: signIn returned
  success: true

[LoginPage] onSubmit: login successful, refreshing router to sync with middleware

[AuthContext] onAuthStateChange: event triggered
  event: "SIGNED_IN"
  hasSession: true
  sessionUserId: "..."

[AuthContext] onAuthStateChange: SIGNED_IN event, loading user

[AuthContext] loadUser: started

[queries/auth] getCurrentUser: started

[queries/auth] getCurrentUser: calling getSession

[queries/auth] getCurrentUser: session found
  userId: "..."
  elapsed: "...ms"

[queries/auth] getCurrentUser: calling getUser

[queries/auth] getCurrentUser: auth user found
  userId: "..."
  email: "test@meit.com"

[queries/auth] getCurrentUser: querying users table with merchant join

[queries/auth] getCurrentUser: completed successfully
  userId: "..."
  email: "test@meit.com"
  merchantId: "..."
  merchantName: "Test Merchant"
  elapsed: "...ms"

[AuthContext] loadUser: user loaded successfully
  id: "..."
  email: "test@meit.com"
  merchantId: "..."
  merchantName: "Test Merchant"

[AuthContext] loadUser: completed, loading state set to false

[Middleware] Processing request started
  path: "/dashboard"
  method: "GET"

[Middleware] Creating Supabase client

[Middleware] Cookie count: 2

[Middleware] Calling getSession

[Middleware] Session check completed
  hasUser: true
  userId: "..."
  elapsed: "...ms"

[Middleware] Route type analysis
  path: "/dashboard"
  isPublicRoute: false
  isProtectedRoute: true
  hasUser: true

[Middleware] DECISION: Allowing request to proceed
  path: "/dashboard"
```

### Expected Outcomes

- Browser redirects to `/dashboard`
- Dashboard page loads successfully
- User information displayed (name, merchant)
- NO redirect loops
- NO errors in console
- Loading spinner appears briefly then disappears
- Total flow completes in < 5 seconds

### Pass Criteria

- All console logs appear in expected sequence
- Final URL is `http://localhost:3001/dashboard`
- User data visible on dashboard
- No JavaScript errors

### Failure Indicators

- Redirect loop between `/login` and `/dashboard`
- Console errors related to navigation
- Stuck on loading spinner
- Empty dashboard (no user data)

---

## Test 2: Cookie Verification

**Priority**: P0 - Must Pass
**Estimated Time**: 2 minutes

### Objective
Verify that the session is stored in HTTP cookies (not localStorage) using `createBrowserClient`.

### Pre-conditions
- User is logged in (from Test 1)

### Test Steps

1. **Open Application Tab in DevTools**
   - DevTools → Application tab
   - Left sidebar → Storage → Cookies
   - Select `http://localhost:3001`

2. **Inspect Supabase Auth Cookies**
   - Look for cookies starting with `sb-yhfmxwleuufwueypmvgm-auth-token`

3. **Check Cookie Properties**
   - Verify `HttpOnly` flag
   - Verify `SameSite` attribute
   - Verify cookie has value (long JWT string)

4. **Verify localStorage is EMPTY**
   - DevTools → Application → Local Storage
   - Select `http://localhost:3001`
   - Should NOT contain `meit-auth-token` or `supabase.auth.token`

### Expected Outcomes

**Cookies Section:**
```
Name: sb-yhfmxwleuufwueypmvgm-auth-token
Value: [long JWT string]
Domain: localhost
Path: /
Expires: [future date]
Size: ~2000 bytes
HttpOnly: ✓
Secure: [✓ if HTTPS, blank for localhost HTTP]
SameSite: Lax
Priority: Medium
```

**Local Storage Section:**
```
(empty or no auth-related entries)
```

### Pass Criteria

- Supabase auth cookie exists
- Cookie has `HttpOnly` flag
- localStorage does NOT contain auth tokens
- Cookie contains valid JWT (can decode at jwt.io if needed)

### Failure Indicators

- No auth cookies found
- Auth token in localStorage
- Cookie missing `HttpOnly` flag

---

## Test 3: Page Refresh Persistence

**Priority**: P0 - Must Pass
**Estimated Time**: 2 minutes

### Objective
Verify that authentication persists across page refreshes (session loaded from cookies).

### Pre-conditions
- User is logged in and on `/dashboard`

### Test Steps

1. **Clear Console**
   - Click "Clear console" button in DevTools

2. **Refresh Page**
   - Press F5 or click browser refresh button

3. **Observe Console Logs**

4. **Verify Dashboard State**
   - User data still displayed
   - No redirect to login

### Expected Console Log Sequence

```
[AuthContext] useEffect: checking for existing session

[AuthContext] useEffect: getSession result
  hasSession: true
  sessionUserId: "..."

[AuthContext] useEffect: existing session found, loading user

[AuthContext] loadUser: started

[queries/auth] getCurrentUser: started

[queries/auth] getCurrentUser: calling getSession

[queries/auth] getCurrentUser: session found
  userId: "..."

[queries/auth] getCurrentUser: completed successfully
  userId: "..."
  email: "test@meit.com"
  merchantId: "..."
  merchantName: "Test Merchant"

[AuthContext] loadUser: user loaded successfully

[Middleware] Processing request started
  path: "/dashboard"

[Middleware] Session check completed
  hasUser: true

[Middleware] DECISION: Allowing request to proceed
```

### Expected Outcomes

- Page refreshes successfully
- User remains on `/dashboard` (no redirect)
- User information still displayed
- Console shows session loaded from cookies
- No re-authentication required

### Pass Criteria

- URL remains `http://localhost:3001/dashboard`
- Dashboard renders with user data
- No redirect to `/login`
- Console confirms session found

### Failure Indicators

- Redirect to `/login` after refresh
- Dashboard shows no user data
- Console errors about missing session

---

## Test 4: Protected Route Access Without Auth

**Priority**: P0 - Must Pass
**Estimated Time**: 2 minutes

### Objective
Verify that unauthenticated users cannot access protected routes.

### Pre-conditions
- User must be logged OUT

### Test Steps

1. **Logout (if logged in)**
   - Click "Cerrar sesión" button on dashboard
   - Wait for redirect to `/login`

2. **Clear Browser Cookies**
   - DevTools → Application → Cookies → Select all → Delete

3. **Clear Console**

4. **Attempt to Access Dashboard Directly**
   ```
   Navigate to: http://localhost:3001/dashboard
   ```

5. **Observe Behavior**

### Expected Console Log Sequence

```
[Middleware] Processing request started
  path: "/dashboard"
  method: "GET"

[Middleware] Creating Supabase client

[Middleware] Cookie count: 0

[Middleware] Calling getSession

[Middleware] Session check completed
  hasUser: false
  elapsed: "...ms"

[Middleware] Route type analysis
  path: "/dashboard"
  isPublicRoute: false
  isProtectedRoute: true
  hasUser: false

[Middleware] REDIRECT DECISION: Protected route without auth, redirecting to /login
  from: "/dashboard"
  to: "/login"
```

### Expected Outcomes

- Immediate redirect to `/login`
- URL becomes `http://localhost:3001/login?redirectedFrom=/dashboard`
- Login form is displayed
- Console shows middleware redirect decision
- No dashboard content rendered

### Pass Criteria

- Browser redirected to `/login`
- Query parameter `?redirectedFrom=/dashboard` present
- Console logs show correct middleware decision
- No errors

### Failure Indicators

- Dashboard content visible without authentication
- No redirect occurs
- Server error or crash

---

## Test 5: Already Authenticated Access to /login

**Priority**: P1 - Should Pass
**Estimated Time**: 2 minutes

### Objective
Verify that authenticated users are redirected away from public auth pages.

### Pre-conditions
- User is logged in (from Test 1)
- Currently on `/dashboard`

### Test Steps

1. **Clear Console**

2. **Navigate to Login Page**
   ```
   Type in address bar: http://localhost:3001/login
   Press Enter
   ```

3. **Observe Behavior**

### Expected Console Log Sequence

```
[Middleware] Processing request started
  path: "/login"
  method: "GET"

[Middleware] Creating Supabase client

[Middleware] Cookie count: 2

[Middleware] Calling getSession

[Middleware] Session check completed
  hasUser: true
  userId: "..."

[Middleware] Route type analysis
  path: "/login"
  isPublicRoute: true
  isProtectedRoute: false
  hasUser: true

[Middleware] REDIRECT DECISION: Public route with auth, redirecting to /dashboard
  from: "/login"
  to: "/dashboard"
  userId: "..."
```

### Expected Outcomes

- Immediate redirect to `/dashboard`
- Login form is NOT visible
- Dashboard loads instead
- Console shows middleware redirect
- Redirect feels instant (< 500ms)

### Pass Criteria

- Browser redirected to `/dashboard`
- No login form rendered
- Middleware logged correct decision
- User data visible on dashboard

### Failure Indicators

- Login form briefly visible before redirect
- Component-level navigation attempts in console
- Multiple redirect cycles

---

## Test 6: Failed Login

**Priority**: P1 - Should Pass
**Estimated Time**: 2 minutes

### Objective
Verify that invalid credentials display an error without causing navigation.

### Pre-conditions
- User is logged out
- On `/login` page

### Test Steps

1. **Clear Console**

2. **Enter Invalid Credentials**
   - Email: `wrong@email.com`
   - Password: `WrongPassword123!`

3. **Submit Form**

4. **Observe Behavior**

### Expected Console Log Sequence

```
[LoginPage] onSubmit: form submitted
  email: "wrong@email.com"

[LoginPage] onSubmit: isLoading set to true, calling signIn

[AuthContext] signIn started
  email: "wrong@email.com"

[mutations/auth] login: started

[mutations/auth] login: calling signInWithPassword

[mutations/auth] login: failed
  error: "Invalid login credentials"
  code: 400
  elapsed: "...ms"

[AuthContext] signIn: login failed
  error: "Invalid login credentials"

[AuthContext] signIn: loading state reset to false

[LoginPage] onSubmit: signIn returned
  success: false

[LoginPage] onSubmit: login failed, resetting isLoading to false
```

### Expected Outcomes

- Error toast appears (red notification)
- User remains on `/login` page
- Form is re-enabled (not disabled)
- Loading spinner stops
- NO navigation occurs
- Error message is user-friendly

### Pass Criteria

- Toast shows "Invalid login credentials" or similar
- URL remains `http://localhost:3001/login`
- Form fields remain editable
- Console shows login failed

### Failure Indicators

- Navigation to dashboard despite error
- Form stuck in loading state
- No error message shown
- Console errors (beyond expected failure)

---

## Test 7: Logout Flow

**Priority**: P1 - Should Pass
**Estimated Time**: 2 minutes

### Objective
Verify that logout clears session and redirects to login page.

### Pre-conditions
- User is logged in
- On `/dashboard` page

### Test Steps

1. **Clear Console**

2. **Click Logout Button**
   - Find "Cerrar sesión" button
   - Click it

3. **Observe Behavior**

### Expected Console Log Sequence

```
[AuthContext] signOut: started

[AuthContext] onAuthStateChange: event triggered
  event: "SIGNED_OUT"

[AuthContext] onAuthStateChange: SIGNED_OUT event

[Middleware] Processing request started
  path: "/login"

[Middleware] Session check completed
  hasUser: false

[Middleware] DECISION: Allowing request to proceed
  path: "/login"
```

### Expected Outcomes

- Success toast appears ("Sesión cerrada correctamente")
- Browser redirects to `/login`
- Cookies are cleared
- Login form is displayed
- Cannot access `/dashboard` anymore (would redirect to `/login`)

### Pass Criteria

- Redirect to `/login` occurs
- Success toast shown
- Cookies cleared (verify in DevTools)
- Console shows SIGNED_OUT event

### Failure Indicators

- No redirect occurs
- Still shows user data
- Cookies remain
- Can still access dashboard

---

## Test 8: Register Flow (Bonus)

**Priority**: P2 - Nice to Have
**Estimated Time**: 3 minutes

### Objective
Verify that new user registration creates account and logs in automatically.

### Pre-conditions
- User is logged out
- Unique email not yet registered

### Test Steps

1. **Navigate to Register Page**
   ```
   URL: http://localhost:3001/register
   ```

2. **Fill Registration Form**
   - Email: `newuser@test.com` (use unique email)
   - Password: `NewUser123!`
   - Name: `New User`
   - Merchant Name: `New Merchant`

3. **Submit Form**

4. **Observe Behavior**

### Expected Outcomes

- Account created successfully
- User automatically logged in
- Session stored in cookies
- Redirect to `/dashboard`
- Dashboard shows new user data
- Merchant name displayed

### Pass Criteria

- Registration completes without errors
- Automatic redirect to dashboard
- User data visible
- Cookies contain auth token

### Failure Indicators

- Registration fails
- No automatic login
- Redirect to login page
- No merchant created

---

## Post-Test Verification

### Performance Benchmarks

Record timing for critical operations:

| Operation | Target Time | Actual Time | Status |
|-----------|-------------|-------------|--------|
| Login to Dashboard | < 3 seconds | ___ seconds | [ ] Pass / [ ] Fail |
| Page Refresh | < 1 second | ___ seconds | [ ] Pass / [ ] Fail |
| Protected Route Redirect | < 500ms | ___ ms | [ ] Pass / [ ] Fail |
| Logout | < 1 second | ___ seconds | [ ] Pass / [ ] Fail |

### Browser Compatibility

Test in multiple browsers:

- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

### Session Security Checklist

- [ ] Session stored in HTTP cookies
- [ ] Cookies have `HttpOnly` flag
- [ ] Cookies have `SameSite` attribute
- [ ] No tokens in localStorage
- [ ] Session expires appropriately
- [ ] Refresh token rotation works

---

## Issue Reporting Template

If a test fails, document it using this format:

```markdown
### Issue #[number]: [Brief Description]

**Test**: [Test name that failed]
**Priority**: P0/P1/P2
**Reproducible**: Yes/No

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Console Logs**:
```
[Paste relevant console output]
```

**Screenshots**:
[Attach if needed]

**Environment**:
- Browser: [Chrome 120]
- OS: [Windows 11]
- Dev Server: [localhost:3001]
- Date: [2025-10-08]
```

---

## Test Completion Checklist

### Core Tests (Must Pass)
- [ ] Test 1: Complete Login Flow
- [ ] Test 2: Cookie Verification
- [ ] Test 3: Page Refresh Persistence
- [ ] Test 4: Protected Route Access Without Auth

### Secondary Tests (Should Pass)
- [ ] Test 5: Already Authenticated Access to /login
- [ ] Test 6: Failed Login
- [ ] Test 7: Logout Flow

### Optional Tests
- [ ] Test 8: Register Flow

### Documentation
- [ ] All console logs captured
- [ ] Timing benchmarks recorded
- [ ] Issues documented (if any)
- [ ] Screenshots taken (if needed)

### Final Verdict
- [ ] **ALL CRITICAL TESTS PASSED** → Implementation is successful
- [ ] **SOME TESTS FAILED** → Review and fix required

---

## Appendix: Console Log Filtering

To make console logs easier to read, you can filter by tag:

**Filter for specific components:**
- `[Middleware]` - Middleware logs only
- `[AuthContext]` - Auth context logs only
- `[LoginPage]` - Login page logs only
- `[mutations/auth]` - Mutation logs only
- `[queries/auth]` - Query logs only

**Filter for events:**
- `REDIRECT DECISION` - See all redirect decisions
- `SIGNED_IN` - See authentication events
- `succeeded` - See successful operations
- `failed` - See failed operations

**Usage in Chrome DevTools Console:**
Type in filter box: `[Middleware]` (shows only middleware logs)

---

## Test Report Template

After completing all tests, fill out this summary:

```markdown
# Authentication Testing - Final Report
**Date**: 2025-10-08
**Tester**: [Your Name]
**Environment**: localhost:3001

## Summary
- Total Tests: 8
- Passed: ___
- Failed: ___
- Skipped: ___

## Critical Tests Status
- [ ] Login Flow: PASS / FAIL
- [ ] Cookie Storage: PASS / FAIL
- [ ] Page Refresh: PASS / FAIL
- [ ] Route Protection: PASS / FAIL

## Performance
- Average Login Time: ___ seconds
- Average Page Load: ___ seconds

## Issues Found
1. [Issue description if any]
2. [Issue description if any]

## Recommendation
[ ] APPROVE - Ready for production
[ ] CONDITIONAL - Minor fixes needed
[ ] REJECT - Major issues found

## Notes
[Additional observations]
```

---

## Support & Questions

If you encounter unclear instructions or unexpected behavior not covered in this guide:

1. Check console logs for diagnostic information
2. Verify environment variables are set correctly
3. Ensure dev server is running on correct port
4. Clear browser cache and cookies
5. Try incognito/private browsing mode

---

**End of Test Execution Guide**
