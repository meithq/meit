# Quick Test Checklist - Phase 4 Authentication

**Test URL**: http://localhost:3001
**Duration**: ~10 minutes
**Priority**: Execute tests 1-4 minimum

---

## Setup (30 seconds)

- [ ] Dev server running: `npm run dev`
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible
- [ ] "Preserve log" enabled
- [ ] Test credentials ready

---

## Critical Tests (Must Pass)

### Test 1: Login Flow (2 min)
- [ ] Navigate to /login
- [ ] Enter valid credentials
- [ ] Click "Iniciar sesión"
- [ ] **VERIFY**: Redirects to /dashboard
- [ ] **VERIFY**: No redirect loops
- [ ] **VERIFY**: User data displayed
- [ ] **VERIFY**: Console shows: `[Middleware] REDIRECT DECISION: Public route with auth, redirecting to /dashboard`

**Result**: [ ] PASS [ ] FAIL

---

### Test 2: Cookie Verification (1 min)
- [ ] DevTools → Application → Cookies → localhost:3001
- [ ] **VERIFY**: Cookie named `sb-yhfmxwleuufwueypmvgm-auth-token` exists
- [ ] **VERIFY**: Cookie has `HttpOnly` flag
- [ ] **VERIFY**: Cookie has `SameSite` attribute
- [ ] DevTools → Application → Local Storage → localhost:3001
- [ ] **VERIFY**: NO `meit-auth-token` or similar auth tokens

**Result**: [ ] PASS [ ] FAIL

---

### Test 3: Page Refresh (1 min)
- [ ] While on /dashboard, press F5
- [ ] **VERIFY**: Stays on /dashboard (no redirect to /login)
- [ ] **VERIFY**: User data still visible
- [ ] **VERIFY**: Console shows: `[AuthContext] useEffect: existing session found`

**Result**: [ ] PASS [ ] FAIL

---

### Test 4: Protected Route Redirect (1 min)
- [ ] Logout (if logged in)
- [ ] Clear all cookies (DevTools → Application → Clear site data)
- [ ] Navigate directly to: http://localhost:3001/dashboard
- [ ] **VERIFY**: Redirects to /login
- [ ] **VERIFY**: URL includes `?redirectedFrom=/dashboard`
- [ ] **VERIFY**: Console shows: `[Middleware] REDIRECT DECISION: Protected route without auth, redirecting to /login`

**Result**: [ ] PASS [ ] FAIL

---

## Secondary Tests (Should Pass)

### Test 5: Authenticated /login Access (1 min)
- [ ] Login (if not logged in)
- [ ] Navigate to: http://localhost:3001/login
- [ ] **VERIFY**: Immediately redirects to /dashboard
- [ ] **VERIFY**: Login form NOT visible

**Result**: [ ] PASS [ ] FAIL

---

### Test 6: Failed Login (1 min)
- [ ] Navigate to /login
- [ ] Enter WRONG email: `wrong@email.com`
- [ ] Enter WRONG password: `WrongPass123`
- [ ] Click "Iniciar sesión"
- [ ] **VERIFY**: Error toast appears
- [ ] **VERIFY**: Stays on /login (no navigation)
- [ ] **VERIFY**: Form re-enabled (spinner stops)

**Result**: [ ] PASS [ ] FAIL

---

### Test 7: Logout (1 min)
- [ ] While on /dashboard, click "Cerrar sesión"
- [ ] **VERIFY**: Redirects to /login
- [ ] **VERIFY**: Success toast appears
- [ ] **VERIFY**: Cookies cleared (check DevTools)
- [ ] **VERIFY**: Cannot access /dashboard anymore

**Result**: [ ] PASS [ ] FAIL

---

## Performance Check

Record actual timings:

| Operation | Time | Target | Status |
|-----------|------|--------|--------|
| Login to Dashboard | ___s | < 5s | [ ] Pass |
| Page Refresh | ___s | < 2s | [ ] Pass |
| Protected Redirect | ___ms | < 500ms | [ ] Pass |

---

## Final Verdict

**Critical Tests Status**:
- Test 1 (Login): [ ] PASS [ ] FAIL
- Test 2 (Cookies): [ ] PASS [ ] FAIL
- Test 3 (Refresh): [ ] PASS [ ] FAIL
- Test 4 (Protection): [ ] PASS [ ] FAIL

**Overall Result**:
- [ ] **ALL PASS** → Implementation successful ✅
- [ ] **SOME FAIL** → Review failures, create bug reports ⚠️

---

## Quick Issue Template

If test fails, note:

**Test**: [Test number that failed]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Error**: [Copy error message]
**Screenshot**: [Attach if needed]

---

## Common Console Commands

Filter logs in Chrome DevTools:

- `[Middleware]` - Middleware logs only
- `[AuthContext]` - Auth context only
- `REDIRECT` - All redirect decisions
- `succeeded` - Successful operations
- `failed` - Failed operations

---

**Completed By**: ________________
**Date**: ________________
**Time**: ________________
