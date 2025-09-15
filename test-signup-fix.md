# Testing the Signup Fix

## Steps to Test:

1. **Run the SQL fix:**
   - Copy the contents of `fix-signup-trigger.sql`
   - Paste into your Supabase SQL Editor
   - Execute the script

2. **Clear browser data:**
   - Clear cookies and localStorage
   - Or use an incognito/private window

3. **Test signup:**
   - Go to `/auth/signup`
   - Fill out the form with:
     - Valid email (e.g., test@example.com)
     - Strong password
     - First/Last name
     - T-shirt size
   - Submit the form

4. **Check for success:**
   - Should redirect to dashboard (in development)
   - Check Supabase Dashboard → Authentication → Users to see if user was created
   - Check Database → profiles table to see if profile was created

## If Still Failing:

1. **Check browser console** for detailed error messages
2. **Check Supabase logs** in Dashboard → Logs
3. **Verify database schema** - ensure all tables and triggers exist
4. **Try with email confirmation disabled** in Supabase Auth settings

## Common Issues:

- **Email already exists**: Try with a different email
- **Password too weak**: Ensure password meets strength requirements
- **RLS policies**: The fix should handle this, but check if policies are too restrictive
- **Missing columns**: The fix adds the size column if missing
