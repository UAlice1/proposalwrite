# Proposal AI — Setup Guide

This guide walks you through setting up the Proposal AI application from scratch.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended for free tier)
- OpenAI API key (optional — app has fallback demo content)
- Google OAuth credentials (optional)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Copy the example env file:

```bash
copy .env.example .env
```

Edit `.env` and fill in your values:

### Required:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
```

### Optional:

```env
OPENAI_API_KEY="sk-proj-..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### How to get each:

**Database (Neon):**
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Use it for both `DATABASE_URL` and `DIRECT_URL`

**NextAuth Secret:**
```bash
openssl rand -base64 32
```

**OpenAI API Key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key
4. **Note:** If you skip this, the app will use demo/placeholder content

**Google OAuth (optional):**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Step 3: Initialize Database

Generate Prisma Client:
```bash
npm run db:generate
```

Push schema to database:
```bash
npm run db:push
```

Optionally open Prisma Studio to view your database:
```bash
npm run db:studio
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the Application

### Quick Demo Login

Use any email with password **"demo"** to create a test account instantly:

- Email: `demo@pryro.com`
- Password: `demo`

### Create Your First Proposal

1. Click **"New Proposal"**
2. Fill in the 3-step form:
   - **Step 1:** Project details (title, budget, scope)
   - **Step 2:** Client info (name, industry, optional SOP link)
   - **Step 3:** Review and generate
3. Click **"Generate Proposal"** — all 7 sections are created automatically
4. Edit any section inline or regenerate with AI
5. Export as PDF or Word

## Key Features to Test

✅ **AI Content Generation** — All sections auto-generated  
✅ **Inline Editing** — Click edit icon on any section  
✅ **Section Regeneration** — Refresh icon to regenerate with AI  
✅ **Export** — Download as PDF (via print) or Word  
✅ **Status Tracking** — Mark proposals as Draft → Sent → Accepted  
✅ **Freemium Limits** — Free plan capped at 3 proposals

## Troubleshooting

### Database Connection Issues

If you see Prisma connection errors:
1. Check your `DATABASE_URL` is correct
2. Ensure your database is running
3. Run `npm run db:push` again

### OpenAI API Errors

If AI generation fails:
1. Check your `OPENAI_API_KEY` is set correctly
2. Ensure you have API credits
3. Without API key, app uses demo content (still functional)

### Port Already in Use

If port 3000 is taken:
```bash
PORT=3001 npm run dev
```

Don't forget to update `NEXTAUTH_URL` in `.env`:
```env
NEXTAUTH_URL="http://localhost:3001"
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production URL
5. Deploy!

### Database Setup

Use Neon for production:
1. Create a production branch in Neon
2. Copy connection string
3. Add to Vercel environment variables
4. Deploy triggers automatic migration

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Auth pages
│   ├── proposals/         # Proposal CRUD
│   └── (app)/            # Protected route group
├── components/            # React components
│   ├── ui/              # Base UI components
│   ├── proposals/       # Proposal-specific components
│   └── layout/          # Layout components
├── lib/                  # Core utilities
│   ├── auth.ts         # NextAuth config
│   ├── db.ts           # Prisma client
│   ├── ai.ts           # OpenAI integration
│   └── utils.ts        # Helper functions
└── types/               # TypeScript types

prisma/
└── schema.prisma        # Database schema
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **AI:** OpenAI GPT-4o-mini
- **Deployment:** Vercel

## Next Steps

- Customize section prompts in `src/lib/ai.ts`
- Add more industries in `src/components/proposals/new-proposal-form.tsx`
- Integrate actual SOP content from Pryro SOP API
- Implement Pro plan with Stripe
- Add email notifications
- Build PDF export with proper formatting

## Support

For issues or questions:
- Check GitHub issues
- Read the [README.md](./README.md)
- Review code comments in key files

## License

MIT
