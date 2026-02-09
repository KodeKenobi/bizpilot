# 🐛 Role Override Bug Fix

## Problem
Admin users in Supabase were being downgraded to "user" role on login.

## Root Cause
The frontend was **hardcoding roles** to either "super_admin" (for kodekenobi@gmail.com) or "user" (for everyone else), overriding the actual role from the database.

## Affected Files

### ✅ Fixed (Frontend)
1. **app/auth/login/page.tsx** - Removed hardcoded role
2. **contexts/UserContext.tsx** - Removed hardcoded role

### ⚠️ Needs Manual Fix (Backend)

**File:** `trevnoctilla-backend/auth_routes.py`

**Line 411** - Change from:
```python
role = data.get('role', 'user')  # ❌ Defaults to 'user'
```

**To:**
```python
role = data.get('role', None)  # ✅ No default, preserves DB role
```

**Line 469-471** - Change from:
```python
if role and user.role != role:
    user.role = role
```

**To:**
```python
# Only update role if explicitly provided (not None)
if role is not None and user.role != role:
    user.role = role
```

## Why This Fix Works

### Before:
1. User has `role="admin"` in Supabase ✅
2. Frontend hardcodes `role="user"` ❌
3. Backend receives `role="user"` and updates database ❌
4. User is now downgraded to "user" ❌

### After:
1. User has `role="admin"` in Supabase ✅
2. Frontend doesn't send role (or sends None) ✅
3. Backend doesn't update role (preserves existing) ✅
4. User keeps `role="admin"` ✅

## Testing

After applying the backend fix, test with:

```bash
# Run the test script
node test-user-dashboard-redirect.js
```

**Expected Results:**
- User: tshepomtshali89@gmail.com
- Role: `admin` (should stay admin)
- Subscription: `enterprise`
- Redirects to: `/admin` dashboard

## Additional Notes

- The special case for `kodekenobi@gmail.com` (super_admin) has been removed
- All roles now come from the database as the source of truth
- The backend `/auth/get-token-from-session` endpoint no longer modifies roles unless explicitly requested
