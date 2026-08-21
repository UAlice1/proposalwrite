# Database Seeding Guide

## Overview
This seed file creates sample proposals for the demo account: **umubyeyialice7@gmail.com**

## What Gets Created

### User Account
- **Email:** umubyeyialice7@gmail.com
- **Password:** Password123!
- **Role:** ORG_ADMIN (full access)
- **Name:** Alice Umubyeyi

### Sample Proposals (8 Total)

1. **Website Redesign for TechStart Solutions** (IT/Software - SENT)
   - Budget: $25k-$35k
   - 3-month timeline
   - Professional tone

2. **Digital Marketing Campaign for GreenLeaf Organics** (Creative - DRAFT)
   - Budget: $15k/month
   - 6-month campaign
   - Conversational tone

3. **Office Building Construction Proposal** (Construction - REVIEW)
   - Budget: $2.5M-$3M
   - 18-month timeline
   - Executive tone

4. **Mobile App Development for FitTrack Pro** (IT/Software - ACCEPTED) ⭐
   - Budget: $85k-$100k
   - 6-month timeline
   - Professional tone
   - Marked as favorite

5. **Brand Identity Package for StartupHub** (Creative - DRAFT)
   - Budget: $8k-$12k
   - 6-week timeline
   - Conversational tone

6. **Business Consulting Services for RetailMax** (Consulting - SENT)
   - Budget: $50k
   - 4-month timeline
   - Executive tone

7. **E-commerce Platform Development** (IT/Software - DRAFT)
   - Budget: $120k
   - 8-month timeline
   - Professional tone

8. **Social Media Content Creation Package** (Freelance - ACCEPTED) ⭐
   - Budget: $3k/month
   - 3-month timeline
   - Conversational tone
   - Marked as favorite

## How to Run the Seed

### Step 1: Install Dependencies
```bash
npm install
```

This will install `tsx` (TypeScript executor) needed for the seed script.

### Step 2: Run the Seed
```bash
npm run seed
```

Or using Prisma directly:
```bash
npx prisma db seed
```

### Step 3: Login
1. Go to your application login page
2. Use credentials:
   - Email: `umubyeyialice7@gmail.com`
   - Password: `Password123!`

## What You'll See

After seeding, you'll have:
- ✅ 8 sample proposals with different statuses
- ✅ Each proposal has 2-4 detailed sections
- ✅ Mix of AI-generated and manual proposals
- ✅ Different proposal types (IT, Creative, Construction, etc.)
- ✅ Various statuses (Draft, Sent, Accepted, Review)
- ✅ 2 favorites marked
- ✅ Activity logs for each proposal

## Testing the Table View

The proposals will display in a beautiful table with:
- Author avatars
- Sortable columns (click headers to sort)
- Status badges
- Favorite indicators (⭐)
- Quick actions menu
- Search and filter functionality

## Reset Database (Optional)

If you want to start fresh:

```bash
# Reset the database and run migrations
npx prisma migrate reset

# This will automatically run the seed after reset
```

## Notes

- The seed script is **idempotent** - it checks if the user exists before creating
- All proposals are created with proper relationships (sections, activities)
- Sample data reflects real-world proposal scenarios
- Mix of tones and types to showcase platform capabilities

## Troubleshooting

**Error: User already exists**
- This is normal if you run the seed multiple times
- The script will use the existing user and add proposals

**Error: Cannot find module 'tsx'**
- Run `npm install` to install all dependencies

**Error: Database connection failed**
- Check your `.env` file has the correct `DATABASE_URL`
- Ensure your database is running

## Customization

To modify the seed data:
1. Edit `prisma/seed.ts`
2. Add/remove proposals from the `proposals` array
3. Run `npm run seed` again
