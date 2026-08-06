# Proposal AI

AI-powered proposal writer integrated into the Pryro SOP ecosystem. Helps African SMEs automatically generate professional, client-ready business proposals, bids, and RFP responses.

## Features

- **AI-Generated Content**: Automatically generate professional proposal sections using OpenAI GPT-4
- **Structured Workflow**: Guided process covering Executive Summary, Problem Statement, Methodology, Timeline, Deliverables, Pricing, and Conclusion
- **Inline Editing**: Edit and regenerate individual sections with AI assistance
- **Export Options**: Download proposals as PDF or Word documents
- **SOP Integration**: Link to Pryro SOP methodologies for enhanced credibility
- **Clean, Minimalist UI**: Matches Pryro SOP design language with Tailwind CSS
- **Freemium Model**: Track usage and plan limits

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth + Credentials)
- **AI**: OpenAI GPT-4 via Vercel AI SDK
- **UI Components**: Custom components built with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (recommended: Neon)
- OpenAI API key

### Installation

1. Clone the repository:

\`\`\`bash
git clone <your-repo-url>
cd proposalwrite
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your credentials:

\`\`\`env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32

# OpenAI
OPENAI_API_KEY="sk-..."

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
\`\`\`

4. Set up the database:

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

5. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Login

For quick testing, use any email with password **"demo"** to auto-create an account.

## Project Structure

\`\`\`
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth handlers
│   │   └── generate/        # AI generation endpoint
│   ├── dashboard/           # Dashboard page
│   ├── login/               # Login page
│   ├── proposals/
│   │   ├── new/            # Create proposal
│   │   └── [id]/           # Edit/view proposal
│   │       ├── export/     # Export preview
│   │       └── actions.ts  # Server actions
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── ui/                 # Base UI components
│   ├── header.tsx
│   ├── proposal-card.tsx
│   └── section-editor.tsx
├── lib/                    # Utilities
│   ├── auth.ts            # NextAuth config
│   ├── db.ts              # Prisma client
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript types
└── prisma/
    └── schema.prisma      # Database schema
\`\`\`

## Key Features Explained

### AI Content Generation

Each proposal section can be generated or regenerated using AI. The system:
1. Collects proposal context (title, client, industry, scope, budget)
2. Sends context + section-specific instructions to OpenAI GPT-4
3. Streams the response back to the UI
4. Allows inline editing and manual refinement

### Section Structure

Every proposal follows this structure:
1. **Executive Summary**: High-level overview and value proposition
2. **Problem Statement**: Client challenge or opportunity
3. **Methodology**: Approach and processes (can pull from linked SOPs)
4. **Timeline**: Implementation schedule with milestones
5. **Deliverables**: Concrete outputs
6. **Pricing & Terms**: Investment breakdown
7. **Conclusion**: Summary and call to action

### SOP Integration

Link proposals to Pryro SOP IDs to reference established methodologies in the Methodology section, enhancing credibility.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Setup (Neon)

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Copy connection string to `DATABASE_URL` and `DIRECT_URL`
3. Run migrations: `npx prisma db push`

## Development Commands

\`\`\`bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
\`\`\`

## Contributing

This is a demo project for the Pryro SOP ecosystem. Contributions welcome!

## License

MIT

## Support

For questions or issues, please open a GitHub issue or contact the maintainer.
