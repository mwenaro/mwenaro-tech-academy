# Database Setup Instructions

The Mwero Tech Academy requires tables to be created in your Supabase database. Follow these steps:

## Step 1: Access Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project: **ocwhilweaenuxxaztvkr**
3. Navigate to **SQL Editor** in the sidebar
4. Click **+ New query**

## Step 2: Run the Schema SQL

Copy the entire content from `supabase/schema.sql` and paste it into the SQL editor, then click **RUN**.

This will create:
- ✅ profiles
- ✅ courses
- ✅ course_modules
- ✅ lessons
- ✅ assignments
- ✅ enrollments
- ✅ submissions
- ✅ certificates
- ✅ lessons_progress
- ✅ All RLS policies
- ✅ Auth triggers for new user profiles

## Step 3: Verify Tables

After running the schema:
1. Go to **Table Editor** in Supabase
2. Verify all tables appear in the list
3. You should see at least these tables:
   - profiles
   - courses
   - course_modules
   - lessons
   - assignments
   - enrollments
   - submissions
   - certificates
   - lessons_progress

## Step 4: Test Connection

Once tables are created:
1. Restart your dev server: `npm run dev`
2. Visit http://localhost:3000/dashboard/profile
3. If you're logged in, your profile should load without errors

## Troubleshooting

If you still see "Could not find the table 'public.profiles'" error:

1. **Check the schema was fully executed** - Look at the SQL editor for any errors (red text)
2. **Verify table existence** - In Supabase Table Editor, search for "profiles"
3. **Check RLS policies** - If tables exist but you get permission errors, verify RLS is enabled
4. **Clear browser cache** - Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)
5. **Restart dev server** - Kill the dev server and run `npm run dev` again

## API Credentials Verification

Your `.env.local` already has the correct Supabase credentials:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

No changes needed there.
