# Mwero Tech Academy

A comprehensive online learning platform for tech education with AI-powered grading, instructor-led courses, and personalized learning paths.

## 🎯 Features

- **Authentication**: Email/password and Google OAuth via Supabase
- **Role-Based Access**: Learner, Instructor, and Admin dashboards
- **Course Management**: Self-paced and instructor-led courses
- **AI-Powered Grading**: Automated project marking with instructor override
- **Certificate Generation**: Automated certificate creation upon course completion
- **Real-time Chat**: Learner-instructor messaging and support tickets
- **Payment Integration**: Course payments and instructor payslips
- **Progress Tracking**: Detailed analytics and progress monitoring
- **Email Notifications**: Automated emails for sessions, payments, and updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI API (for grading, recommendations, certificates)
- **Payments**: Stripe
- **Email**: SendGrid
- **State Management**: Zustand
- **UI Components**: Lucide React Icons, React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account
- OpenAI API key (optional, for AI features)
- Stripe account (optional, for payments)
- SendGrid API key (optional, for emails)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Set up Supabase database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL to create all tables, policies, and functions

4. **Enable Google OAuth in Supabase** (optional)

   - Go to Authentication → Providers in your Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials
   - Add authorized redirect URL: `http://localhost:3000/auth/callback`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette

- **Primary (Deep Blue)**: `#1E3A8A` - Trust and professionalism
- **Secondary (Bright Teal)**: `#14B8A6` - Friendly and approachable
- **Accent (Warm Yellow)**: `#FBBF24` - Highlights and CTAs
- **Background (Light Gray)**: `#F3F4F6` - Clean and minimal
- **Foreground (Dark Charcoal)**: `#111827` - Text and contrast

## 👥 User Roles

### Learner
- Browse and enroll in courses
- Complete lessons and assignments
- Submit projects (GitHub/Google Docs)
- Chat with instructors
- View progress and certificates

### Instructor
- Manage assigned courses
- View enrolled learners
- Review and grade submissions
- Schedule and manage sessions
- View payment history

### Admin
- Manage all courses and users
- View site-wide analytics
- Configure system settings
- Oversee payments and support

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
```

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI tutors for personalized guidance
- [ ] Gamification features
- [ ] Course bundles and subscriptions

---

Built with ❤️ by Mwero Tech Academy

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
