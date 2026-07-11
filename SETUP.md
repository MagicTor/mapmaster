# MapMaster Setup & Implementation Guide

## ✨ Project Overview

MapMaster is a production-ready, browser-based geography game built with modern web technologies. This guide walks you through setting up the development environment and implementing the core features.

## 📋 Checklist for Complete Setup

### Phase 1: Development Environment (Estimated: 30 mins)

- [ ] **Install Node.js**
  - Download from https://nodejs.org/ (20.x LTS recommended)
  - Verify: `node --version` and `npm --version`

- [ ] **Clone Repository**
  ```bash
  git clone https://github.com/yourusername/mapmaster.git
  cd mapmaster
  ```

- [ ] **Install Dependencies**
  ```bash
  npm install
  ```

- [ ] **Create Environment File**
  ```bash
  cp .env.example .env.local
  # Edit .env.local with your values
  ```

- [ ] **Install PostgreSQL** (if not already installed)
  - macOS: `brew install postgresql@14`
  - Windows: https://www.postgresql.org/download/windows/
  - Linux: `sudo apt-get install postgresql-14`

### Phase 2: Database Setup (Estimated: 20 mins)

- [ ] **Start PostgreSQL**
  ```bash
  # macOS
  brew services start postgresql@14
  
  # Windows (via pgAdmin or command line)
  # Linux
  sudo systemctl start postgresql
  ```

- [ ] **Create Database**
  ```bash
  createdb mapmaster_dev
  createdb mapmaster_test
  ```

- [ ] **Setup Prisma**
  ```bash
  # Generate Prisma client
  npx prisma generate
  
  # Sync schema to database (this repo currently has no committed migrations folder)
  npm run db:push
  
  # Open Prisma Studio (optional, for visual DB management)
  npx prisma studio
  ```

- [ ] **Seed Sample Data** (optional)
  ```bash
  npm run db:seed
  ```

### Phase 3: Authentication Setup (Estimated: 15 mins)

- [ ] **Create Clerk Account**
  - Go to https://dashboard.clerk.com
  - Sign up and create a new application
  - Copy your publishable key and secret key

- [ ] **Configure Clerk in .env.local**
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
  CLERK_SECRET_KEY=sk_test_xxx
  CLERK_WEBHOOK_SECRET=whsec_xxx
  ```

- [ ] **Add Clerk to Next.js**
  - Follow the Clerk documentation for Next.js integration
  - Clerk will provide setup instructions in dashboard

### Phase 4: Development Server (Estimated: 5 mins)

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```

- [ ] **Verify Server**
  - Open http://localhost:3000
  - You should see the MapMaster homepage

- [ ] **Check Database Connection**
  - Server should connect to PostgreSQL without errors
  - Check terminal for any connection warnings

### Phase 5: Run Tests (Estimated: 10 mins)

- [ ] **Run Unit Tests**
  ```bash
  npm run test
  ```

- [ ] **Run Type Checking**
  ```bash
  npm run type-check
  ```

- [ ] **Run Linting**
  ```bash
  npm run lint
  ```

---

## 🚀 Implementation Roadmap

### Week 1-2: Foundation & Core Components

**Tasks**:
1. ✅ Setup project structure
2. ✅ Create TypeScript types and constants
3. ⏳ Implement layout components (Header, Navigation, Footer)
4. ⏳ Create shared components (Button, Card, Modal, etc.)
5. ⏳ Setup Zustand stores (Game, User, UI, Settings)
6. ⏳ Create home page with landing sections

**Definition of Done**:
- All components render without errors
- TypeScript strict mode passes
- Basic navigation works
- All shared components have stories in Storybook

### Week 2-3: Game Core

**Tasks**:
1. ⏳ Build GameMap component with SVG rendering
2. ⏳ Implement CountryHitbox components
3. ⏳ Create question generation logic
4. ⏳ Build scoring system
5. ⏳ Implement timer system
6. ⏳ Create game setup flow

**Definition of Done**:
- Game map renders all countries
- Clicking countries registers correctly
- Scoring calculates properly
- Timer counts down correctly

### Week 3-4: Game Flow & Results

**Tasks**:
1. ⏳ Implement game session management
2. ⏳ Create game state machine
3. ⏳ Build answer submission logic
4. ⏳ Create results page with statistics
5. ⏳ Implement achievement checking
6. ⏳ Add visual feedback (animations, sounds)

**Definition of Done**:
- Full game flow works end-to-end
- Results page shows all stats
- Achievements unlock correctly
- Sound effects play

### Week 4-5: Backend & API

**Tasks**:
1. ⏳ Create all API route handlers
2. ⏳ Implement game session endpoints
3. ⏳ Build score submission and leaderboard
4. ⏳ Create user stats endpoints
5. ⏳ Implement achievement checking logic
6. ⏳ Add input validation and error handling

**Definition of Done**:
- All API endpoints return correct responses
- Database operations work correctly
- Error handling is comprehensive
- API documentation is complete

### Week 5-6: Features & Polish

**Tasks**:
1. ⏳ Implement profile page
2. ⏳ Create statistics dashboard
3. ⏳ Build achievement gallery
4. ⏳ Implement leaderboards
5. ⏳ Add daily challenges
6. ⏳ Optimize performance

**Definition of Done**:
- All pages load without errors
- Statistics display correctly
- Leaderboards show proper rankings
- Lighthouse score >90

### Week 6-8: Testing & Deployment

**Tasks**:
1. ⏳ Write unit tests (80% coverage)
2. ⏳ Write E2E tests for critical flows
3. ⏳ Performance testing and optimization
4. ⏳ Security audit
5. ⏳ Deploy to staging
6. ⏳ Deploy to production

**Definition of Done**:
- 80% test coverage
- All critical flows tested
- Performance meets targets
- No security issues found
- Live in production

---

## 💾 Key Database Operations

### Seed Countries Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create countries
  const france = await prisma.country.create({
    data: {
      id: 'FRA',
      iso2: 'FR',
      iso3: 'FRA',
      numeric: 250,
      name: 'France',
      capital: 'Paris',
      region: 'Europe',
      flagEmoji: '🇫🇷',
      difficulty: 'easy'
    }
  });

  console.log(`Created country: ${france.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Then run:
```bash
npx prisma db seed
```

### Query Examples

```typescript
// Get all countries in a region
const europeanCountries = await prisma.country.findMany({
  where: { region: 'Europe' }
});

// Create a game session
const gameSession = await prisma.gameSession.create({
  data: {
    userId: 'user123',
    selectedRegions: JSON.stringify(['Europe']),
    quizTypes: JSON.stringify(['Country', 'Capital']),
    gameMode: 'timed',
    difficulty: 'medium',
    questionCount: 10,
    questions: []
  }
});

// Update player stats
await prisma.playerStats.update({
  where: { userId: 'user123' },
  data: {
    totalGamesPlayed: { increment: 1 },
    totalScore: { increment: 500 }
  }
});
```

---

## 🔧 Environment Variable Guide

```bash
# Database Connection
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mapmaster_dev

# Clerk Authentication
# Get from: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Redis (Optional, for caching)
REDIS_URL=redis://localhost:6379

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
API_INTERNAL_URL=http://localhost:3000

# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key

# Session Security
SESSION_SECRET=your-very-long-secret-key-minimum-32-characters

# Encryption Key
ENCRYPTION_KEY=your-encryption-key-minimum-32-characters

# Environment
NEXT_PUBLIC_ENVIRONMENT=development

# Feature Flags
NEXT_PUBLIC_ENABLE_MULTIPLAYER=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 📱 Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3000
npm run dev --turbo     # Start with Turbopack (faster)

# Building
npm run build           # Create production build
npm start              # Run production build

# Database
npx prisma generate    # Generate Prisma client
npm run db:push        # Sync schema to database
npm run db:seed        # Run seed script
npx prisma studio     # Open visual DB browser

# Testing
npm run test           # Run unit tests (Jest)
npm run test:e2e       # Run E2E tests (Playwright)
npm run test:watch     # Run tests in watch mode

# Code Quality
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript type checking
npm run format         # Format code with Prettier

# Analysis
npm run analyze        # Analyze bundle size
```

---

## 🎨 Component Storybook Setup (Future)

Install Storybook:
```bash
npx storybook@latest init
```

Example story:

```typescript
// src/components/shared/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Click me',
  },
};
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Check database exists
psql -l | grep mapmaster_dev

# Create database if missing
createdb mapmaster_dev
```

### Prisma Migration Issues
```bash
# Reset database (dev only!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Port Already in Use
```bash
# Kill process using port 3000
# macOS/Linux:
lsof -ti :3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check
```

---

## ✅ Pre-Launch Checklist

- [ ] All tests passing (>80% coverage)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Performance targets met (Lighthouse >90)
- [ ] Database migrations tested
- [ ] API endpoints verified
- [ ] Error handling complete
- [ ] Security audit passed
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Performance optimized (bundle < 500KB, FCP < 2s)
- [ ] Documentation complete
- [ ] Deployment tested on staging

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Clerk Docs**: https://clerk.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 🤝 Getting Help

- **Project Docs**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: dev-team@mapmaster.com

---

**Happy coding! 🚀**
