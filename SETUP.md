# Mwero Tech Academy - Complete Setup Guide

This guide will walk you through setting up the Mwero Tech Academy platform from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Authentication Setup](#authentication-setup)
6. [Optional Integrations](#optional-integrations)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

You'll also need accounts for:
- **Supabase** (free tier available) - [Sign up](https://supabase.com)
- **OpenAI** (optional, for AI features) - [Sign up](https://openai.com)
- **Stripe** (optional, for payments) - [Sign up](https://stripe.com)
- **SendGrid** (optional, for emails) - [Sign up](https://sendgrid.com)

## Supabase Setup

### 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: mwero-tech-academy
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### 2. Get Your API Keys

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - ⚠️ Keep this secret!

## Environment Configuration

### 1. Create Environment File

In the project root, create a `.env.local` file:

```bash
cp .env.example .env.local
```

### 2. Add Supabase Credentials

Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

### 1. Run Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click "New Query"
4. Open `supabase/schema.sql` from this project
5. Copy all the SQL code
6. Paste it into the Supabase SQL Editor
7. Click "Run" or press `Ctrl+Enter`

This will create:
- All database tables
- Custom types (enums)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers and functions
- Initial constraints

### 2. Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all these tables:
   - profiles
   - courses
   - course_modules
   - lessons
   - enrollments
   - assignments
   - submissions
   - certificates
   - messages
   - support_tickets
   - sessions
   - progress_tracking
   - instructor_payments

## Authentication Setup

### 1. Enable Email Authentication

Email authentication is enabled by default in Supabase.

To customize email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email, password reset, etc.
3. Use your app URL: `http://localhost:3000` (or production URL later)

### 2. Enable Google OAuth (Optional)

1. **Create Google OAuth Credentials**
   
   a. Go to [Google Cloud Console](https://console.cloud.google.com)
   b. Create a new project or select existing
   c. Go to "APIs & Services" → "Credentials"
   d. Click "Create Credentials" → "OAuth client ID"
   e. Choose "Web application"
   f. Add authorized redirect URIs:
      - `https://your-project.supabase.co/auth/v1/callback`
   g. Save and copy the Client ID and Client Secret

2. **Configure in Supabase**
   
   a. Go to **Authentication** → **Providers**
   b. Find "Google" and toggle it on
   c. Paste your Client ID and Client Secret
   d. Save changes

### 3. Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (change for production)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

## Optional Integrations

### OpenAI (AI Features)

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   ```

### Stripe (Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from **Developers** → **API keys**
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_... (after webhook setup)
   ```

### SendGrid (Email Notifications)

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Create an API key
3. Verify a sender email
4. Add to `.env.local`:
   ```env
   SENDGRID_API_KEY=SG...
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

## Running the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Mwero Tech Academy homepage!

## Testing

### Test User Registration

1. Go to `/auth/register`
2. Create a test account
3. Check your email for verification (if email is configured)
4. Login at `/auth/login`

### Test User Roles

To test different roles, update a user's role in Supabase:

1. Go to **Table Editor** → **profiles**
2. Find your user
3. Edit the `role` field to:
   - `learner` (default)
   - `instructor`
   - `admin`

### Create Test Data

To test the platform, you'll need some courses:

1. Update your role to `admin`
2. Go to `/dashboard`
3. Navigate to "Manage Courses"
4. Create test courses, modules, and lessons

Or run SQL to insert sample data:

```sql
-- Insert a sample course
INSERT INTO courses (title, description, category, level, duration_weeks, price, course_type)
VALUES (
  'Web Development Fundamentals',
  'Learn HTML, CSS, and JavaScript from scratch',
  'Web Development',
  'beginner',
  8,
  49.99,
  'self-paced'
);
```

## Troubleshooting

### Issue: "Invalid JWT token"

**Solution**: Check that your Supabase URL and keys in `.env.local` are correct.

### Issue: "Failed to fetch"

**Solution**: 
- Ensure Supabase project is running
- Check your internet connection
- Verify API keys are correct

### Issue: Google OAuth not working

**Solution**:
- Verify redirect URI in Google Console matches Supabase callback URL
- Ensure Google provider is enabled in Supabase
- Clear browser cache and cookies

### Issue: Database tables not created

**Solution**:
- Check SQL Editor for errors
- Ensure you copied the entire `schema.sql` file
- Try running each section separately if there are errors

### Issue: "Module not found" errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not loading

**Solution**:
- Restart the dev server
- Check `tailwind.config.ts` is present
- Ensure `globals.css` imports Tailwind

## Next Steps

Once everything is working:

1. **Customize Branding**: Update colors, logos, and text
2. **Add Content**: Create courses, modules, and lessons
3. **Configure AI**: Set up OpenAI for grading and recommendations
4. **Set up Payments**: Configure Stripe for course purchases
5. **Deploy**: Deploy to Vercel or your preferred hosting

## Production Deployment

When ready to deploy:

1. Update environment variables with production values
2. Change `NEXT_PUBLIC_APP_URL` to your domain
3. Update Supabase authentication URLs
4. Configure custom domain in Supabase
5. Enable HTTPS

For detailed deployment instructions, see the main README.md.

## Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Create an issue on GitHub
- Contact support at support@mwerotechacademy.com

---

Happy Building! 🚀
