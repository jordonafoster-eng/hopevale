# Quick Start Guide - HopeVale Church Friends

## 🚀 5-Minute Setup

### Step 1: Get a Free Database (2 minutes)

**Option A: Supabase (Recommended - Free Forever)**
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free, no credit card)
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" under "Connection pooling"
6. It looks like: `postgresql://postgres.[project]:[password]@[region].pooler.supabase.com:5432/postgres`

**Option B: Neon Database**
1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Copy connection string

### Step 2: Configure Environment

Open `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="your-connection-string-here"
```

### Step 3: Initialize Database

```bash
# Push database schema
npm run db:push

# Seed with sample data
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 🔑 Default Login Credentials

After seeding:
- **Admin**: admin@example.com / admin123
- **Member**: john@example.com / member123

## ✅ What's Included

- ✅ Full authentication (email/password + Google OAuth ready)
- ✅ Events with RSVP system
- ✅ Prayer Wall with reactions
- ✅ Reflections with tagging
- ✅ Recipes with ratings
- ✅ Music playlists
- ✅ Kids Corner
- ✅ Feedback form
- ✅ Dark mode
- ✅ Mobile responsive

## 🎨 Features to Test

1. **Sign up** as a new user
2. **Create an event** and RSVP
3. **Post a prayer** request
4. **Share a reflection** with tags
5. **Submit a recipe** and rate it
6. **Download** a kids resource
7. **Toggle dark mode**
8. **Test mobile** responsive design

## 🔧 Troubleshooting

**Database connection fails?**
- Check your DATABASE_URL is correct
- Make sure the password is URL-encoded
- Try connection pooling URL from Supabase

**Build errors?**
- Delete node_modules and run `npm install` again
- Make sure you're using Node 18+

**Prisma errors?**
- Run `npm run db:generate` to regenerate Prisma client

## 📚 Next Steps

1. Test all features
2. Customize theme colors in `tailwind.config.ts`
3. Add your logo and branding
4. Set up Google OAuth (optional)
5. Deploy to Vercel

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

That's it! You're ready to go! 🎉
