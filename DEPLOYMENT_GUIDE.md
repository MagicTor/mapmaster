# MapMaster - Backend Setup & Deployment Guide

## Environment Setup

### Prerequisites
- Node.js 20+ and npm 10+
- PostgreSQL 12+
- Clerk account (https://clerk.com)
- Vercel account (optional, for deployment)

### 1. Install Node.js and npm (Debian)

```bash
sudo apt update
sudo apt install -y curl ca-certificates gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values:
# - DATABASE_URL: PostgreSQL connection string
# - CLERK authentication keys
# - NEXT_PUBLIC_APP_URL: your app URL
```

**Required variables:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mapmaster
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Sync schema to database (repo currently has no committed prisma/migrations folder)
npm run db:push

# Seed 203 countries into database
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs at: http://localhost:3000

## API Verification

After setup, test the API endpoints:

```bash
# Create a game
curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "region": "Europe",
    "questionTypes": ["countries"],
    "mode": "challenge"
  }'
```

See `API_DOCUMENTATION.md` for all endpoint specifications.

---

## Database Schema

The backend uses 4 tables:

1. **User** - Clerk auth + profile
2. **Country** - 203 countries with metadata
3. **ChallengeResult** - Leaderboard entries (Challenge mode only)
4. **LeaderboardCache** (optional) - Pre-calculated rankings

See `prisma/schema.prisma` for complete schema.

---

## Project Structure

```
MapMaster/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Country seeding (203 countries)
├── src/
│   ├── app/
│   │   ├── api/                # All API routes
│   │   │   ├── games/
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts (GET)
│   │   │   │       ├── submit/
│   │   │   │       └── complete/
│   │   │   ├── leaderboards/
│   │   │   │   └── [region]/[combo]/
│   │   │   │       ├── route.ts (GET leaderboard)
│   │   │   │       └── user/[userId]/
│   │   │   ├── stats/
│   │   │   │   └── user/[userId]/
│   │   │   └── data/
│   │   │       ├── countries/[region]/
│   │   │       └── flags/[countryId]/
│   │   └── layout.tsx          # Root layout
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── game-utils.ts       # Game logic utilities
│   │   ├── validation.ts       # Zod schemas
│   │   └── constants.ts        # App constants
│   └── styles/
├── .env.example                # Environment template
├── API_DOCUMENTATION.md        # API reference
├── package.json
├── tsconfig.json
└── README.md
```

---

## Scripts

```bash
# Development
npm run dev                     # Start dev server

# Database
npm run prisma:generate        # Generate Prisma client
npm run db:push                # Sync schema to database
npm run prisma:studio          # Open Prisma Studio (DB browser)
npm run db:seed                # Seed 203 countries

# Build & Production
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run format                 # Format code with Prettier
npm run type-check             # Type check with TypeScript

# Testing
npm run test                   # Run tests (not yet implemented)
npm run test:e2e              # Run E2E tests (not yet implemented)
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial backend implementation"
git push origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Set `NODE_ENV=production`
5. Deploy

### 3. Post-Deployment

```bash
# Generate Prisma client and sync schema in production
vercel env pull
npm run prisma:generate
npm run db:push

# Seed production database
npm run db:seed
```

---

## Monitoring & Logging

### Development
- Prisma logs queries, errors, and warnings in console
- Check `API_DOCUMENTATION.md` for endpoint details

### Production (TODO)
- Set up Sentry (error tracking) - add `NEXT_PUBLIC_SENTRY_DSN`
- Set up PostHog (analytics) - add `NEXT_PUBLIC_POSTHOG_KEY`
- Enable database query logging with appropriate level

---

## Testing API Endpoints

### Manual Testing with curl

```bash
# Test game creation
curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{"region":"Europe","questionTypes":["countries"],"mode":"challenge"}'

# Test answer submission
curl -X POST http://localhost:3000/api/games/GAME_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{"countryId":"DE","questionType":"countries"}'

# Test leaderboard
curl http://localhost:3000/api/leaderboards/Europe/countries \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

### Integration Testing (TODO)
Create `src/__tests__/api/*.test.ts` files to test:
- Ranking algorithm (lives → incorrect guesses → date)
- Leaderboard segmentation (region × combo × month)
- Game state validation
- User authentication

---

## Common Issues & Solutions

### Issue: `DATABASE_URL is not set`
**Solution:** Check `.env.local` has `DATABASE_URL` with valid PostgreSQL connection string

### Issue: Prisma client not generated
**Solution:** Run `npm run prisma:generate`

### Issue: Countries not in database
**Solution:** Run `npm run db:seed`

### Issue: Clerk authentication failing
**Solution:** 
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
- Ensure Clerk project is properly configured
- Check Clerk webhook is set up for user sync

### Issue: Leaderboard not returning results
**Solution:**
- Ensure at least one Challenge game has been completed successfully
- Check month/year parameters match when Challenge was completed
- Verify question types combo matches exactly (hyphen-separated, sorted)

---

## Next Steps for Frontend Implementation

Once backend is deployed and verified:

1. **Create Zustand stores** (`src/store/`)
   - `gameStore` - game state, current question, countries
   - `uiStore` - page navigation, selected region/types
   - `userStore` - auth, profile, cached leaderboards

2. **Build frontend pages** (`src/app/`)
   - HomePage - region selection
   - RegionPage - Practice/Challenge/Leaderboard buttons
   - GamePage - interactive map, question prompt
   - ResultsPage - game results
   - LeaderboardPage - rankings with month selector

3. **Create components** (`src/components/`)
   - GameMap (SVG-based, clickable countries)
   - QuestionPrompt (display question based on type)
   - StatusBar (lives, incorrect guesses, progress)
   - LeaderboardTable (ranked results)
   - MonthSelector (for leaderboard history)

4. **Implement game logic**
   - Question generation (random selection from region)
   - Question mixing (if multiple types selected)
   - Lives system (3 lives, -1 per wrong answer)
   - Country highlighting (green for correct, outline for unanswered)
   - Result calculation and posting to leaderboard

---

## Performance Targets

- First contentful paint: < 2s
- Time to interactive: < 3s
- API response time: < 200ms
- Game map interaction: 60 FPS
- Lighthouse score: 90+

Monitor with:
```bash
npm run build  # Check build size and performance
```

---

## Security Checklist

- ✅ All API endpoints require Clerk authentication
- ✅ Input validation with Zod schemas
- ✅ Prisma prevents SQL injection (parameterized queries)
- ✅ Environment variables for sensitive data
- ⚠️ TODO: Rate limiting (prevent API abuse)
- ⚠️ TODO: CORS configuration
- ⚠️ TODO: HTTPS enforcement in production

---

## Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for endpoint specs
2. Review `prisma/schema.prisma` for data model
3. Check Clerk docs: https://clerk.com/docs
4. Review Prisma docs: https://www.prisma.io/docs/
