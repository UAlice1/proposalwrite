# Proposal AI — Pre-Launch Checklist

Use this checklist to ensure everything is working before going live.

## ✅ Environment Setup

- [ ] `.env` file created from `.env.example`
- [ ] `DATABASE_URL` configured (Neon or local PostgreSQL)
- [ ] `DIRECT_URL` configured
- [ ] `NEXTAUTH_URL` set correctly (`http://localhost:3000` for local)
- [ ] `NEXTAUTH_SECRET` generated (run `openssl rand -base64 32`)
- [ ] `OPENAI_API_KEY` added (or skip for demo mode)
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (optional)

## ✅ Database Setup

- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run db:generate` to generate Prisma Client
- [ ] Run `npm run db:push` to create database tables
- [ ] (Optional) Run `npm run db:studio` to verify tables were created

## ✅ Application Testing

### Authentication
- [ ] Can navigate to `/login`
- [ ] Can sign in with demo credentials (any email + password "demo")
- [ ] Can sign in with Google OAuth (if configured)
- [ ] Redirects to `/dashboard` after login
- [ ] Can sign out successfully

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Shows "0 Total Proposals" for new user
- [ ] "New Proposal" button works
- [ ] Stats cards display correctly

### Proposal Creation
- [ ] Can access `/proposals/new`
- [ ] Step 1: Can enter title, budget, project scope
- [ ] Step 2: Can enter client name and industry
- [ ] Step 3: Review page shows all entered data
- [ ] "Generate Proposal" button triggers creation
- [ ] Redirects to proposal editor after generation
- [ ] All 7 sections are pre-populated with content

### Proposal Editor
- [ ] Can view generated proposal
- [ ] All sections display correctly
- [ ] Can edit individual sections (click edit icon)
- [ ] Can save edited sections
- [ ] Can regenerate individual sections (click refresh icon)
- [ ] Export dropdown shows PDF and Word options
- [ ] Can mark proposal as "Sent"
- [ ] Badge updates when status changes

### Proposal List
- [ ] Can view `/proposals` page
- [ ] Created proposals appear in the list
- [ ] Can search proposals by title
- [ ] Can filter proposals by status
- [ ] Click on proposal card navigates to editor

### Export
- [ ] PDF export works (triggers browser print dialog)
- [ ] Word export downloads a file
- [ ] Exported content includes all sections
- [ ] Client information appears in export

### Freemium Limits
- [ ] Free users can create up to 3 proposals
- [ ] Warning banner appears when approaching limit
- [ ] Block appears after 3 proposals
- [ ] Upgrade prompt shows correctly

## ✅ Edge Cases

- [ ] What happens with empty project scope? (Should show validation)
- [ ] Can create proposal without optional fields (industry, budget, SOP ID)?
- [ ] Can edit proposal after marking as "Sent"?
- [ ] Can regenerate section multiple times?
- [ ] Does middleware protect `/dashboard` and `/proposals/*` routes?
- [ ] Do unauthenticated users get redirected to `/login`?

## ✅ UI/UX

- [ ] All pages load quickly (<3 seconds)
- [ ] No console errors in browser dev tools
- [ ] Mobile layout works (test on phone or narrow browser window)
- [ ] All buttons have hover states
- [ ] Loading states show during async operations
- [ ] Error messages display when operations fail
- [ ] Success feedback appears (e.g., "Saved" badge)

## ✅ Performance

- [ ] Images load quickly (check public folder assets)
- [ ] No hydration errors in console
- [ ] Database queries return in reasonable time
- [ ] AI generation completes within ~10 seconds (if API key configured)
- [ ] Demo content displays instantly (fallback mode)

## ✅ Code Quality

- [ ] Run `npm run lint` — no critical errors
- [ ] Run TypeScript check: `npx tsc --noEmit` — no type errors
- [ ] Check Prisma schema: `npx prisma validate`
- [ ] Git repo initialized with `.gitignore`
- [ ] `.env` file is in `.gitignore` (security!)

## ✅ Production Readiness

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Use production database (not local)
- [ ] Set `NODE_ENV=production`
- [ ] Configure Vercel/deployment environment variables
- [ ] Test deployed version thoroughly
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure custom domain (if applicable)
- [ ] Enable HTTPS (Vercel handles this automatically)

## ✅ Documentation

- [ ] README.md is complete and accurate
- [ ] SETUP.md walks through installation
- [ ] Code comments explain complex logic
- [ ] API endpoints are documented (consider adding JSDoc)
- [ ] Environment variables are documented

## 🚀 Launch

Once all items are checked:

1. **Commit your code:**
   ```bash
   git add .
   git commit -m "Initial launch of Proposal AI"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Connect GitHub repo
   - Add environment variables
   - Deploy!

3. **Post-Launch Monitoring:**
   - Monitor for errors in first 24 hours
   - Check database usage/limits
   - Review OpenAI API usage and costs
   - Collect user feedback

4. **Next Iterations:**
   - Add Stripe integration for Pro plan
   - Improve AI prompts based on user feedback
   - Add real SOP integration with Pryro API
   - Build richer export formats (styled PDF)
   - Add collaboration features (share proposals)

---

## Common Issues & Fixes

**"Module not found: Can't resolve..."**
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall

**"Database connection refused"**
- Check `DATABASE_URL` is correct
- Ensure database is running
- Verify network access (firewall, IP whitelist)

**"NextAuth configuration error"**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- For Google OAuth, verify redirect URIs match

**"OpenAI API error"**
- Check API key is valid
- Verify you have credits
- Without key, app falls back to demo content (still works!)

**"Prisma Client not generated"**
- Run `npm run db:generate`
- Restart your dev server

---

Good luck with your launch! 🎉
