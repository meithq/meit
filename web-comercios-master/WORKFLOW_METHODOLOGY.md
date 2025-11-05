# Workflow Methodology - MEIT Implementation Commands

**Created:** 2025-10-09
**Project:** MEIT Ecosystem - web-comercios
**Purpose:** Standard workflow for executing implementation commands 01-14

---

## Overview

This document defines the proven workflow methodology for implementing the 14 slash commands in the MEIT project. This process was validated during Command 01 and should be followed for all subsequent commands.

---

## Sequential Branch Strategy

### Core Principle: **One Branch at a Time**

```
Command 01: feature/01-base-components → test → merge → delete
Command 02: feature/02-shared-infrastructure → test → merge → delete
Command 03: feature/03-dashboard-home → test → merge → delete
...
Command 14: feature/14-tests → test → merge → delete
```

### ✅ Advantages
- Each branch builds on previous work
- No merge conflicts (sequential integration)
- Master is always in working state
- Easy to identify which command caused issues
- Clean git history

### ❌ Avoid: Creating All Branches First
- Branches become outdated (missing previous implementations)
- High risk of merge conflicts
- Difficult to maintain consistency
- Can't test integrated functionality

---

## Standard Workflow (7 Steps)

### Step 1: Implementation by Specialized Agent

**Agent:** Varies by command (sr-frontend-engineer, sr-backend-engineer, etc.)

**Process:**
1. **Git Branch Creation**
   ```bash
   git checkout master
   git checkout -b feature/XX-command-name
   ```

   ⚠️ **CRITICAL:** Do NOT run `git init` - repository already exists!

2. **Install Dependencies** (if needed)
   ```bash
   npm install <packages>
   ```

3. **Implement All Required Files**
   - Follow design system (02-ui-design-system.md)
   - Follow implementation guidelines (10-implementation-guidelines.md)
   - Follow project conventions (CLAUDE.md)

4. **Git Commit**
   ```bash
   git add .
   git commit -m "feat: descriptive message

   - Bullet point 1
   - Bullet point 2

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

---

### Step 2: QA Validation (Initial)

**Agent:** qa-test-automation-engineer

**Validation Checklist:**

**A) Git Status Check**
```bash
git status
git branch
git log --oneline -5
```
- ✅ On correct feature branch
- ✅ No uncommitted changes
- ✅ Commit message follows conventions

**B) File Structure Verification**
```bash
ls -la src/components/ui/
ls -la src/components/forms/
# etc.
```
- ✅ All expected files exist
- ✅ No unexpected files
- ✅ Proper directory structure

**C) Code Review - Critical Components**
- Review 3-5 most important files
- Check TypeScript types
- Check accessibility attributes
- Check design system compliance (colors, spacing)

**D) TypeScript Build Test** ⚠️ **CRITICAL**
```bash
npm run build
```
- ✅ Must succeed with 0 errors
- ⚠️ Warnings are acceptable (document them)
- ❌ Any error = REJECT

**E) Lint Check**
```bash
npm run lint
```
- ✅ 0 critical errors
- ⚠️ Warnings are acceptable

**F) Development Server Test**
```bash
npm run dev
```
- ✅ Server starts without errors
- ✅ No compilation errors
- ✅ No runtime errors

**G) Design System Compliance**
```bash
grep -r "primary-600" src/components/
grep -r "accent-" src/components/
```
- ✅ MEIT colors used (primary-600: #812797)
- ✅ No hardcoded hex colors
- ✅ Tailwind classes only

**H) Accessibility Check**
```bash
grep -i "aria" src/components/
grep -i "role" src/components/
```
- ✅ ARIA attributes present
- ✅ Proper roles defined
- ✅ WCAG 2.1 AA compliance

---

### Step 3: Decision Point

**If QA PASSES:**
→ Go to Step 6 (Merge)

**If QA FAILS:**
→ Go to Step 4 (Fix)

---

### Step 4: Fix Critical Errors

**Agent:** Same agent that did implementation (sr-frontend-engineer, etc.)

**Process:**
1. **Review QA Report**
   - Identify all CRITICAL errors
   - Note file paths and line numbers

2. **Apply Fixes**
   - Fix ONLY the reported errors
   - Do NOT modify unrelated code
   - Maintain original functionality

3. **Verify Locally**
   ```bash
   npm run build
   npm run lint
   ```

4. **Git Commit Fixes**
   ```bash
   git add .
   git commit -m "fix: resolve critical errors from QA

   - Fix error 1 description
   - Fix error 2 description

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

---

### Step 5: QA Re-Validation

**Agent:** qa-test-automation-engineer

**Process:**
1. **Verify Fixes in Code**
   ```bash
   cat src/path/to/fixed-file.tsx
   grep "specific pattern" src/path/to/file.tsx
   ```

2. **Re-run Critical Tests**
   ```bash
   npm run build  # Must succeed
   npm run lint   # Must pass
   npm run dev    # Must start
   ```

3. **Decision:**
   - ✅ **APPROVED** → Go to Step 6
   - ❌ **REJECTED** → Back to Step 4

---

### Step 6: Merge to Master

**Process:**

```bash
# 1. Switch to master
git checkout master

# 2. Ensure master is clean
git status
git pull  # Only if working with remote

# 3. Merge feature branch (no fast-forward to preserve history)
git merge --no-ff feature/XX-command-name -m "Merge branch 'feature/XX-command-name' - Description

- Feature 1
- Feature 2
- Feature 3
- QA approved"

# 4. Verify merge succeeded
git log --oneline -3

# 5. Verify build on master
npm run build

# 6. Verify dev server on master
npm run dev
```

**Expected:**
- ✅ Merge completes without conflicts
- ✅ Build succeeds on master
- ✅ Dev server starts on master
- ✅ No regressions

---

### Step 7: Cleanup & Prepare Next Command

**Process:**

```bash
# 1. Delete feature branch (locally)
git branch -d feature/XX-command-name

# 2. Verify master status
git status
git branch  # Should only show master

# 3. Optional: Push to remote
git push origin master

# 4. Ready for next command
# Master now has all changes from Command XX
# Command XX+1 will be created FROM this updated master
```

---

## Common Issues & Solutions

### Issue 1: "Git repository not found"

**Cause:** Agent tried to run `git init` in existing repo

**Solution:**
- ⚠️ **NEVER** run `git init` - repository already exists at `apps/web-comercios`
- ✅ Only create branches: `git checkout -b feature/XX-name`

---

### Issue 2: "React Hook called conditionally"

**Example:**
```typescript
// ❌ WRONG - useId called conditionally
const id = providedId || `field-${React.useId()}`;

// ✅ CORRECT - useId called unconditionally at top level
const generatedId = React.useId();
const id = providedId || `field-${generatedId}`;
```

**Lesson:** All React Hooks must be called at top level, never inside conditionals/ternaries.

---

### Issue 3: "Build fails but works in dev"

**Cause:** TypeScript strict mode catches errors in build that dev mode ignores

**Solution:**
- Always run `npm run build` during QA
- Fix all TypeScript errors before merge
- Don't rely on dev server alone

---

### Issue 4: "ESLint prefer-const error"

**Example:**
```typescript
// ❌ WRONG - variable never reassigned
let response = NextResponse.next({...});

// ✅ CORRECT - use const for immutability
const response = NextResponse.next({...});
```

**Lesson:** Use `const` by default, only use `let` if variable will be reassigned.

---

## QA Severity Levels

### CRITICAL ❌ (Blocks Merge)
- Build fails (TypeScript errors)
- Lint critical errors
- Missing required files
- Import errors
- Dev server won't start
- Security vulnerabilities

### HIGH ⚠️ (Should Fix Before Merge)
- Missing accessibility attributes
- Wrong colors used (not MEIT design system)
- Performance issues
- Missing error handling

### MEDIUM 📝 (Can Fix Later)
- Minor style inconsistencies
- Lint warnings (non-critical)
- Missing comments/documentation
- Suboptimal patterns (but functional)

### LOW 💡 (Optional)
- Code style preferences
- Additional optimizations
- Nice-to-have features

---

## Git Commit Message Standards

### Format:
```
<type>: <short description>

<detailed description with bullet points>

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactor (no behavior change)
- `style:` - Formatting, missing semicolons, etc.
- `docs:` - Documentation only
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples:

**Feature Implementation:**
```
feat: implement base UI component library

- Add 11 core UI components (button, input, card, etc.)
- Add 3 form components with React Hook Form integration
- Add 4 layout components (sidebar, header, etc.)
- WCAG 2.1 AA compliant
- Mobile-first responsive design

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Bug Fix:**
```
fix: resolve critical React Hook and ESLint errors

- Fix React.useId() conditional call in form-field.tsx
- Fix React.useId() conditional call in select.tsx
- Change let to const in middleware.ts
- Resolves QA validation failures

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Command 01 Case Study

### Timeline:
1. **Implementation** (15 min) - sr-frontend-engineer created 19 files
2. **QA Initial** (10 min) - Detected 3 critical errors
3. **Fix** (5 min) - Applied corrections
4. **QA Re-validation** (5 min) - Approved
5. **Merge** (2 min) - Integrated to master
6. **Cleanup** (1 min) - Deleted branch

**Total Time:** ~38 minutes
**Files Created:** 19
**Lines Added:** 2,149
**Build Status:** ✅ Success
**QA Score:** 100%

### Errors Found & Fixed:

1. **form-field.tsx:30** - React.useId() called conditionally
2. **select.tsx:59** - React.useId() called conditionally
3. **middleware.ts:14** - Used `let` instead of `const`

### Lessons Learned:

✅ **What Worked:**
- QA caught errors before merge
- Sequential workflow prevented conflicts
- Master remained stable throughout
- Clear documentation of fixes

⚠️ **Improvements for Next Commands:**
- Remind agents about React Rules of Hooks
- Emphasize ESLint compliance from start
- Don't skip build test during implementation

---

## Agent Instructions Template

Use this template when invoking agents for Commands 02-14:

```markdown
## IMPORTANT: Follow Established Workflow

**Reference:** C:\Users\elegi\Documents\meit-ecosystem\WORKFLOW_METHODOLOGY.md

### Git Setup:
- ⚠️ **DO NOT** run `git init` - repository already exists
- ✅ Create branch: `git checkout -b feature/XX-command-name`
- ✅ Work from current master (has all previous commands integrated)

### Implementation Requirements:
- Follow design system (02-ui-design-system.md)
- Follow implementation guidelines (10-implementation-guidelines.md)
- Follow project conventions (CLAUDE.md)
- TypeScript strict mode
- WCAG 2.1 AA accessibility
- Mobile-first responsive

### Quality Gates:
- ✅ `npm run build` must succeed
- ✅ `npm run lint` must pass (0 critical errors)
- ✅ All React Hooks called unconditionally
- ✅ Use `const` by default (not `let` unless reassigned)
- ✅ MEIT colors (primary-600, accents, neutrals)

### Commit Standards:
- Use conventional commit format
- Include bullet points
- Add Claude Code attribution

### Testing Before Commit:
- Run `npm run build` locally
- Run `npm run lint` locally
- Verify imports work
- Check for TypeScript errors
```

---

## Success Criteria by Command Type

### Frontend Commands (01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12)
- ✅ Components render without errors
- ✅ Forms validate correctly
- ✅ API integration works
- ✅ Responsive on mobile/tablet/desktop
- ✅ Accessibility attributes present
- ✅ Loading/error states implemented

### Backend Commands (13)
- ✅ API routes respond correctly
- ✅ Database queries execute
- ✅ Error handling implemented
- ✅ Authentication/authorization enforced
- ✅ RLS policies working

### Testing Commands (14)
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ E2E tests pass
- ✅ Coverage > 80% for critical flows
- ✅ Accessibility tests pass

---

## Next Command Checklist

Before executing `/02-setup-shared-infrastructure` or any subsequent command:

- [ ] Verify on `master` branch
- [ ] Master is clean (`git status`)
- [ ] Previous command merged successfully
- [ ] Build works on master (`npm run build`)
- [ ] Reference this methodology document
- [ ] Remind agents: NO `git init`
- [ ] Follow 7-step workflow

---

## File Locations Reference

**Working Directory:**
```
C:\Users\elegi\Documents\meit-ecosystem\apps\web-comercios
```

**Git Repository:**
- Already initialized at `apps/web-comercios`
- Current branch: `master`
- Remote: `origin/master`

**Documentation:**
- Design System: `project-documentation/corte-01/design-documentation/02-ui-design-system.md`
- Implementation Guide: `project-documentation/corte-01/design-documentation/10-implementation-guidelines.md`
- Project Conventions: `CLAUDE.md`
- Implementation Plan: `IMPLEMENTATION_PLAN.md`
- **This Workflow:** `WORKFLOW_METHODOLOGY.md`

---

## Troubleshooting

### "Branch already exists"
```bash
# Delete old branch if exists
git branch -D feature/XX-name

# Create fresh branch
git checkout master
git checkout -b feature/XX-name
```

### "Build fails after merge"
```bash
# Revert merge
git reset --hard HEAD~1

# Re-investigate issue on feature branch
git checkout feature/XX-name
npm run build
# Fix errors, commit, re-merge
```

### "Can't switch to master - uncommitted changes"
```bash
# Stash changes
git stash

# Switch to master
git checkout master

# Apply stash later if needed
git stash pop
```

---

## Summary

This workflow ensures:
- ✅ High code quality through mandatory QA
- ✅ Master branch always stable
- ✅ Clear git history
- ✅ No merge conflicts
- ✅ Easy to debug issues
- ✅ Consistent process across all 14 commands

**Follow this methodology for Commands 02-14 to maintain quality and efficiency.**

---

**Document Version:** 1.0
**Last Updated:** 2025-10-09
**Status:** ✅ Validated with Command 01
**Next Review:** After Command 05
