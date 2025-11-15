# Church Friends

A full-featured community management platform built with Next.js 15, featuring events, prayer wall, reflections, recipes, music playlists, and kids resources.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **Database**: PostgreSQL via Prisma
- **Authentication**: NextAuth.js v5 (Email/Password + Google OAuth)
- **Storage**: Supabase Storage
- **Email**: Resend
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel + Supabase

## Features

- **Home**: Hero section, upcoming events, latest prayer & reflections
- **Events**: Calendar view, RSVP system with adult/kids counts, capacity management
- **Prayer Wall**: Requests & praise reports, anonymous posting, reactions, moderation queue
- **Reflections**: Threaded posts about spiritual growth, tagging, search
- **Recipes**: Community recipes with ratings, comments, potluck tags
- **Music**: YouTube playlist embeds, podcast links
- **Kids Corner**: Memory verses, activity sheets, coloring PDFs
- **Feedback**: Categorized feedback form with admin management
- **Admin Dashboard**: Role management, content moderation, event CRUD, settings
- **Dark Mode**: Global theme toggle with system preference detection
- **Mobile-First**: Fully responsive design with mobile navigation

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)
- npm or pnpm

## Setup Instructions

### 1. Clone and Install

```bash
cd community-app
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Then create a database
createdb community_app
```

#### Option B: Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in your values:

```env
# Database (use your Supabase or local PostgreSQL URL)
DATABASE_URL="postgresql://user:password@localhost:5432/community_app"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional - get from console.cloud.google.com)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend (get from resend.com)
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
RESEND_ADMIN_EMAIL="admin@yourdomain.com"

# Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional: Upstash Redis for rate limiting
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Church Friends"
```

### 4. Database Migration

Run Prisma migrations to create tables:

```bash
npm run db:migrate
```

Or push schema directly (for development):

```bash
npm run db:push
```

### 5. Seed Database

Populate with sample data:

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Member users: `john@example.com` / `member123`, `jane@example.com` / `member123`
- Sample events, prayers, reflections, recipes, and more

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
community-app/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── events/            # Events pages
│   ├── prayer/            # Prayer wall
│   ├── reflections/       # Reflections
│   ├── recipes/           # Recipes
│   ├── music/             # Music playlists
│   ├── kids/              # Kids corner
│   ├── feedback/          # Feedback form
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── theme-provider.tsx
│   └── ...
├── lib/                   # Utilities and configs
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   ├── auth-utils.ts     # Auth helpers
│   └── utils.ts          # Common utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── types/                 # TypeScript types
├── tests/                 # Tests (Vitest + Playwright)
└── tailwind.config.ts    # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (dev)
- `npm run db:migrate` - Run migrations (production)
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (warning: deletes all data)
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## Authentication Setup

### Email/Password

Email/password authentication works out of the box. Users can:
- Sign up with email/password
- Sign in with email/password
- Request password reset (requires Resend setup)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

## Supabase Storage Setup

For file uploads (Kids Corner PDFs):

1. In Supabase dashboard, go to Storage
2. Create bucket named `community-files`
3. Set bucket to public or configure RLS policies
4. Add environment variables to `.env`

## Customizing Theme

Edit `tailwind.config.ts` to customize colors:

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        // Your primary brand colors
        500: '#your-color',
        600: '#your-color',
      },
      accent: {
        // Your accent colors
        500: '#your-color',
        600: '#your-color',
      },
    },
  },
},
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Database Migration

For production, use migrations instead of `db:push`:

```bash
# Create migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

## Features Roadmap

- [x] Core authentication (email/password, Google OAuth)
- [x] Global layout with dark mode
- [x] Home page with latest content
- [ ] Complete auth pages (sign up, password reset)
- [ ] Events page with calendar view
- [ ] Prayer wall with reactions
- [ ] Reflections with search
- [ ] Recipes with ratings
- [ ] Music playlists
- [ ] Kids Corner with file uploads
- [ ] Feedback system
- [ ] Admin dashboard
- [ ] API routes with validation
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Testing suite

## Contributing

This is a custom community platform. If you'd like to contribute:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact the admin.
