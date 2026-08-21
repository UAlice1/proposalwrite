# PryroProposal — AI-Powered Proposal Generator

A production-ready AI-powered platform for creating, managing, and exporting professional business proposals.

## ✨ Features

### 🤖 AI-Powered Generation
- **AI Proposal Generation** — Describe your project in plain English; AI generates a complete professional proposal
- **AI Writing Tools** — Improve, rewrite, fix grammar, and refine any section
- **Multi-Provider AI** — OpenAI, Anthropic, Groq, OpenRouter, DeepSeek, Mistral, custom OpenAI-compatible APIs
- **Smart Regeneration** — Regenerate individual sections with AI while keeping others

### 📝 Proposal Management
- **Full Proposal Editor** — Edit title, client info, budget, timeline, and all sections
- **Multiple Proposal Types** — Consulting, Construction, Creative, IT/Software, Freelance, General
- **Tone Preferences** — Professional, Conversational, or Executive writing styles
- **Version Control** — Track changes and maintain proposal history
- **Status Tracking** — Draft, Review, Sent, Accepted, Rejected, Archived

### 📊 Organization & Workflow
- **Table View** — Modern sortable table with avatars, status badges, and quick actions
- **Search & Filter** — Find proposals by name, status, type, or client
- **Favorites** — Star important proposals for quick access
- **Activity Log** — Full audit trail of all changes
- **Dashboard** — Stats, recent proposals, activity feed, AI usage tracking

### 🎨 User Experience
- **Clean Modern UI** — Minimal design with consistent blue branding
- **Dark / Light Mode** — System-aware theme switching
- **Command Palette** — ⌘K quick navigation and proposal search
- **Responsive Design** — Works perfectly on desktop, tablet, and mobile

### 📤 Export & Sharing
- **Multiple Formats** — Export as PDF, DOCX (Word), HTML, or Markdown
- **Professional Formatting** — Clean, branded export templates
- **Print-Ready** — Optimized for professional printing

### 👥 Collaboration
- **Comments** — Comment threads on each proposal
- **Team Management** — Role-based access (Admin, Manager, Employee)
- **Organization Support** — Multi-user organizations with shared proposals
- **Activity Feed** — See who's working on what

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + Custom Kibo UI table
- **Animations**: Framer Motion
- **Auth**: NextAuth v5 (JWT strategy, Google OAuth)
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Forms**: React Hook Form + Zod validation
- **State**: TanStack Query
- **AI Integration**: Groq, OpenAI, and custom providers

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Neon serverless)
- npm or yarn

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
AUTH_SECRET="your-auth-secret-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# AI Provider (Groq recommended)
GROQ_API_KEY="your_groq_api_key"

# Email (optional - for notifications)
EMAIL_FROM="your-email@example.com"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your_app_password"
```

Generate secrets:
```bash
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For AUTH_SECRET
```

### 4. Set up database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 5. Seed sample data (optional)

```bash
npm run seed
```

This creates 8 sample proposals for testing.

### 6. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, register, password reset
│   ├── (app)/               # Protected app pages
│   │   ├── dashboard/       # Dashboard with stats
│   │   ├── proposals/       # Proposal list, new, detail
│   │   │   ├── new/         # Create new proposal
│   │   │   └── [id]/        # View/edit proposal
│   │   ├── settings/        # AI & profile settings
│   │   └── assistant/       # AI assistant
│   └── api/                 # API routes
│       ├── ai/              # AI generation & tools
│       ├── auth/            # NextAuth + registration
│       ├── proposals/       # CRUD + sections + export
│       └── dashboard/       # Stats & analytics
├── components/
│   ├── ui/                  # Base UI components (Radix)
│   ├── kibo-ui/            # Custom table component
│   ├── layout/              # Sidebar, header, navigation
│   ├── proposals/           # Proposal editor & list
│   ├── dashboard/           # Dashboard widgets
│   ├── settings/            # Settings forms
│   └── auth/                # Auth forms
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── ai.ts               # AI provider abstraction
│   ├── utils.ts            # Helpers & constants
│   └── toast.ts            # Toast notifications
├── hooks/
│   └── use-debounce.ts     # Debounce hook
└── prisma/
    ├── schema.prisma        # Database schema
    ├── seed.ts             # Sample data seeder
    └── migrations/         # Database migrations
```

## 🗄️ Database Schema

### Core Models

- **User** — Authentication, roles, organization membership
- **Organization** — Team/company with multiple users
- **Proposal** — Main proposal document with metadata
- **ProposalSection** — Individual proposal sections (executive summary, scope, deliverables, etc.)
- **ProposalVersion** — Version history and change tracking
- **Activity** — Audit log for all actions
- **AIGeneration** — Track AI usage and costs
- **AISettings** — Per-user AI provider configuration
- **ExportHistory** — Track exports for analytics

### Proposal Types

- Consulting
- Construction  
- Creative
- IT/Software
- Freelance
- General

### Proposal Statuses

- Draft — Work in progress
- Review — Ready for review
- Sent — Sent to client
- Accepted — Won! 🎉
- Rejected — Not this time
- Archived — Historical record

## 🎨 AI Configuration

After signing up, go to **Settings → AI Provider** to configure:

| Provider | Best For | Models |
|----------|----------|--------|
| **Groq** (Recommended) | Fast & Free | llama-3.3-70b-versatile |
| OpenAI | Highest Quality | gpt-4o, gpt-4-turbo |
| Anthropic | Long Documents | claude-3-5-sonnet |
| OpenRouter | Variety | 100+ models |
| Custom | Self-hosted | Any OpenAI-compatible API |

API keys are stored encrypted per user.

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run seed            # Seed sample proposals
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create/run migrations
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables (see `.env` example)
4. Set `AUTH_URL` to your production domain
5. Deploy!

### Environment Variables for Production

```env
# REQUIRED
DATABASE_URL=your_production_database_url
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-strong-secret
AUTH_SECRET=your-auth-secret
GROQ_API_KEY=your_groq_api_key

# OPTIONAL
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_FROM=your-email@example.com
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

**Important:** Don't forget to update Google OAuth redirect URIs:
```
https://your-domain.vercel.app/api/auth/callback/google
```

## 🎯 Key Features in Detail

### Table View
- Sortable columns (Name, Type, Status, Updated)
- Author avatars
- Status badges with color coding
- Quick actions menu (View, Favorite, Duplicate, Archive, Delete)
- Search and advanced filtering
- Pagination

### AI Generation
- Describe project in natural language
- Select proposal type and tone
- AI generates complete proposal with multiple sections
- Edit individual sections
- Regenerate sections independently

### Export Options
- **PDF** — Print-ready professional format
- **DOCX** — Editable Microsoft Word document
- **HTML** — Web-ready format
- **Markdown** — Plain text with formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues, questions, or feature requests, please:
- Open an issue on GitHub
- Contact: pryrolab@gmail.com

---

Built with ❤️ by PryroLab

**PryroProposal** — Professional proposals, powered by AI
