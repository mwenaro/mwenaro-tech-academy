# Quick Start Guide

Get Mwero Tech Academy running in under 30 minutes!

## Prerequisites Checklist

- [ ] Node.js 20+ installed ([Download](https://nodejs.org))
- [ ] Code editor (VS Code recommended)
- [ ] Supabase account ([Sign up free](https://supabase.com))

## 5-Step Setup

### 1️⃣ Install Dependencies (2 min)

```bash
cd mwerotech-academy
npm install
```

### 2️⃣ Create Supabase Project (5 min)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - Name: `mwero-tech-academy`
   - Database Password: (create strong password, save it!)
   - Region: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### 3️⃣ Configure Environment (3 min)

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. In Supabase dashboard, go to **Settings → API**

3. Copy these values to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

4. Set app URL:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4️⃣ Set Up Database (5 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `supabase/schema.sql` from this project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or Ctrl+Enter)
7. Verify no errors appear
8. Go to **Table Editor** - you should see 13 tables!

### 5️⃣ Start the App (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Test It Out

### Create Your First Account

1. Click **"Get Started"** or **"Register"**
2. Fill in your details:
   - Full Name
   - Email
   - Password (6+ characters)
3. Click **"Create Account"**
4. Login with your credentials

### Access Dashboard

1. After login, you'll be redirected to `/dashboard`
2. You should see:
   - Welcome message with your name
   - Stats (all zeros for now)
   - Empty course list

### Change Your Role (Optional)

To test different features:

1. Go to Supabase dashboard
2. Navigate to **Table Editor → profiles**
3. Find your user row
4. Click to edit
5. Change `role` from `learner` to:
   - `instructor` - to see instructor features
   - `admin` - to see admin features
6. Refresh your dashboard

## Add Sample Course (Admin Only)

Make yourself an admin first (see above), then:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO courses (
  title,
  description,
  category,
  level,
  duration_weeks,
  price,
  course_type,
  is_active
) VALUES (
  'Web Development Fundamentals',
  'Learn HTML, CSS, and JavaScript from scratch. Perfect for beginners starting their coding journey.',
  'Web Development',
  'beginner',
  8,
  49.99,
  'self-paced',
  true
);
```

Now visit [/courses](http://localhost:3000/courses) to see your course!

## Enable Google OAuth (Optional)

### Get Google Credentials (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Go to **"APIs & Services" → "Credentials"**
4. Click **"Create Credentials" → "OAuth client ID"**
5. Choose **"Web application"**
6. Add redirect URI:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Replace xxxxx with your Supabase project ID)
7. Save and copy **Client ID** and **Client Secret**

### Configure in Supabase (2 min)

1. In Supabase: **Authentication → Providers**
2. Find **"Google"** and toggle ON
3. Paste Client ID and Client Secret
4. Save

Now you'll see "Continue with Google" on login/register pages!

## Common Issues

### ❌ "Invalid JWT token"
**Fix**: Check that your Supabase URL and keys in `.env.local` are correct

### ❌ "Failed to fetch"
**Fix**: 
- Ensure Supabase project is running
- Verify `.env.local` has correct values
- Restart dev server: `npm run dev`

### ❌ Database tables not created
**Fix**:
- Check SQL Editor for errors
- Ensure you copied the ENTIRE `schema.sql` file
- Try running sections one at a time

### ❌ White screen after login
**Fix**:
- Open browser console (F12)
- Look for specific errors
- Verify database tables exist
- Check that profile was created (go to Table Editor → profiles)

## Next Steps

Now that it's running:

1. ✅ **Explore the UI** - Navigate through the dashboard
2. ✅ **Create sample courses** - Add courses as admin
3. ✅ **Test enrollment** - Enroll in courses as learner
4. ✅ **Build features** - Start developing new pages

## Development Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Build for production
npm run lint      # Check code quality
npm run format    # Auto-format code
```

## File Structure Quick Reference

```
src/
├── app/
│   ├── auth/          # Login & Register pages
│   ├── dashboard/     # User dashboard
│   ├── courses/       # Course catalog
│   └── page.tsx       # Homepage
├── lib/supabase/      # Database connection
└── middleware.ts      # Route protection
```

## Resources

- 📖 [Full README](./README.md) - Complete documentation
- 🔧 [Setup Guide](./SETUP.md) - Detailed setup instructions
- 📊 [Project Status](./PROJECT_STATUS.md) - What's built & what's next
- 🔗 [Next.js Docs](https://nextjs.org/docs)
- 🗄️ [Supabase Docs](https://supabase.com/docs)

## Need Help?

1. Check error messages in terminal and browser console
2. Review SETUP.md for detailed troubleshooting
3. Ensure all environment variables are set
4. Verify database tables were created successfully

---

Happy coding! 🚀 You're ready to build an amazing learning platform.
