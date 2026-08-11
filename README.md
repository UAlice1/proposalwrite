# PryroWriter

AI-powered business proposal generator built for African SMEs.

## What it does

- Create a workspace for your company (name, logo, brand color)
- Start a new proposal: select a proposal type (Consulting, Construction, Creative, IT/Software, Freelance), fill in your company info, client info, project details, budget, timeline, and tone preference
- Click **Generate** — AI produces a complete, structured proposal: Cover Letter, Executive Summary, Problem & Solution, Scope of Work, Timeline, Pricing, Terms & Conditions, and Closing
- Edit any section inline or regenerate individual sections with AI
- Export as PDF or Word (.docx) styled with your company branding

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL via Neon (Prisma ORM)
- **Auth**: NextAuth v5 (credentials + Google OAuth)
- **AI**: Groq (llama-3.3-70b-versatile) via OpenAI-compatible API
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **Export**: Custom HTML/PDF generator + docx library

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/UAlice1/proposalwrite.git
cd proposalwrite
npm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
DATABASE_URL="your-neon-postgresql-url"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="your-groq-api-key"
AI_PROVIDER="groq"
AI_MODEL="llama-3.3-70b-versatile"
```

### 3. Set up the database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Proposal Types

- **Consulting** — Strategic recommendations, methodology, ROI
- **Construction** — Bid breakdown, materials, labour, compliance
- **Creative** — Creative brief, concept, deliverables, revision policy
- **IT / Software** — Technical architecture, milestones, SLAs, IP ownership
- **Freelance** — Simple scope, rate, payment schedule
- **General** — All-purpose business proposal

## Tone Options

- **Professional** — Formal, polished, corporate
- **Conversational** — Friendly, clear, approachable
- **Executive** — Concise, high-level, ROI-focused

## Built by

Pryro Company — [pryro.com](https://pryro.com)
