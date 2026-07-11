# System Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Map**: react-simple-maps or GeoJSON-based SVG
- **HTTP**: Axios

### Backend
- **Runtime**: Node.js
- **API Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Local username/password + JWT
- **Validation**: Zod

### Infrastructure
- **Hosting**: Vercel (frontend + backend)
- **Database**: PostgreSQL (managed service or self-hosted)
- **File Storage**: Cloudinary (flag images) or GitHub CDN

---

## System Architecture Diagram

```
┌─────────────────────────────────────┐
│      NEXTJS APP (FRONTEND)          │
│  • Pages: Home, Region, Game        │
│  • Components: Map, Questions       │
│  • State: Zustand stores            │
└──────────┬──────────────────────────┘
           │
           │ HTTP API Calls
           ▼
┌─────────────────────────────────────┐
│     NEXTJS API ROUTES (BACKEND)     │
│  • /api/games/create                │
│  • /api/games/:id/submit            │
│  • /api/leaderboard/:region/:combo  │
│  • /api/stats/:userId               │
└──────────┬──────────────────────────┘
           │
           │ Database Queries
           ▼
┌─────────────────────────────────────┐
│         POSTGRESQL DATABASE         │
│  • Users                            │
│  • Countries                        │
│  • ChallengeResults                 │
│  • Leaderboard Cache (optional)     │
└─────────────────────────────────────┘
```

---

## Data Flow

### Game Flow (Challenge Mode)

```
1. User selects region
2. User selects question types
3. Frontend creates game session
   POST /api/games/create
   {
     region: "Europe",
     questionTypes: ["countries", "flags"],
     mode: "challenge"
   }
4. Backend returns:
   {
     gameId: "uuid",
     region: "Europe",
     totalCountries: 47,
     selectedCountries: [shuffled array]
   }
5. Frontend loads map and starts timer
6. User answers questions
7. For each answer:
   POST /api/games/:gameId/submit
   {
     countryId: "de",
     questionType: "countries",
     correct: true
   }
8. Backend returns:
   {
     correct: true,
     remainingCountries: 46,
     livesRemaining: 3
   }
9. When complete or timer expires:
   POST /api/games/:gameId/complete
   {
     completedAt: timestamp,
     livesRemaining: 2
   }
10. Backend creates leaderboard entry if successful
11. Frontend displays results
```

---

## API Endpoints

### Games
- **POST /api/games/create** - Create new game session
- **POST /api/games/:id/submit** - Submit answer
- **POST /api/games/:id/complete** - End game session
- **GET /api/games/:id** - Get game state

### Leaderboards
- **GET /api/leaderboards/:region/:combo/:month** - Get leaderboard for specific month
- **GET /api/leaderboards/:region/:combo** - Get current month leaderboard
- **GET /api/leaderboards/:userId/:region/:combo** - Get user's rank in specific board

### Statistics
- **GET /api/stats/user/:userId** - Get user's stats across all regions
- **GET /api/stats/region/:region** - Get region statistics

### Data
- **GET /api/data/countries/:region** - Get countries for region
- **GET /api/data/countries/:id** - Get country details

---

## State Management (Zustand Stores)

### gameStore
```typescript
{
  gameId: string;
  region: string;
  mode: "practice" | "challenge";
  questionTypes: string[];
  currentQuestion: Question;
  countries: Country[];
  answeredCountries: Set<string>;
  timeRemaining: number;
  livesRemaining: number;
  completionTime: number;
  actions: {
    initialize(config);
    submitAnswer(countryId);
    skipQuestion();
    revealAnswer();
    endGame();
    resetGame();
  };
}
```

### uiStore
```typescript
{
  currentPage: "home" | "region" | "game" | "results" | "leaderboard";
  selectedRegion: string;
  selectedQuestionTypes: string[];
  modal: {
    isOpen: boolean;
    type: string;
  };
  actions: {
    navigate(page);
    openModal(type);
    closeModal();
  };
}
```

### userStore
```typescript
{
  user: User | null;
  isLoading: boolean;
  actions: {
    login();
    logout();
    fetchProfile();
  };
}
```

---

## Component Hierarchy

### Pages
- `app/page.tsx` - Home (region selection)
- `app/region/[name]/page.tsx` - Region page (Practice/Challenge/Leaderboard buttons)
- `app/game/[id]/page.tsx` - Active game
- `app/results/[id]/page.tsx` - Results screen
- `app/leaderboard/[region]/[combo]/page.tsx` - Leaderboard view

### Layout Components
- `Layout` - Root layout with header/footer
- `Header` - Navigation bar
- `RegionSelector` - 7 region buttons

### Game Components
- `GameMap` - Interactive SVG map
- `Country` - Individual country element (SVG path)
- `QuestionPrompt` - Current question display
- `FlagImage` - Flag display for flag questions
- `StatusBar` - Lives/Timer/Progress display
- `GameControls` - Reveal/Skip buttons (Practice only)

### UI Components
- `Button`, `Card`, `Modal`, `Input` - Shared components
- `Modal/QuestionTypeSelector` - Checkbox selection
- `Loading`, `Spinner` - Loading states
- `Toast` - Notifications

### Leaderboard Components
- `LeaderboardTable` - Rankings display
- `MonthSelector` - Month/Year navigation
- `StatisticsPanel` - Region statistics display

---

## Database Schema

### Users
```sql
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Countries
```sql
CREATE TABLE "Country" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capital TEXT NOT NULL,
  region TEXT NOT NULL,
  flagUrl TEXT,
  svgPath TEXT,
  iso2 TEXT,
  iso3 TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ChallengeResults
```sql
CREATE TABLE "ChallengeResult" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  region TEXT NOT NULL,
  questionTypes TEXT NOT NULL, -- JSON: ["countries", "flags"]
  completionTimeMs INT NOT NULL,
  livesRemaining INT NOT NULL (0-3),
  successful BOOLEAN NOT NULL,
  completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES "User"(id),
  INDEX idx_leaderboard (region, questionTypes, completedAt),
  INDEX idx_user (userId),
  UNIQUE KEY monthly_user_combo (userId, region, questionTypes, DATE(completedAt))
);
```

### MonthlyStats (Optional Cache)
```sql
CREATE TABLE "MonthlyStats" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  region TEXT NOT NULL,
  questionTypes TEXT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  bestCompletionTimeMs INT,
  bestLivesRemaining INT,
  completionCount INT DEFAULT 0,
  leaderboardRank INT,
  totalPlayers INT,
  
  FOREIGN KEY (userId) REFERENCES "User"(id),
  UNIQUE KEY stats_key (userId, region, questionTypes, month, year)
);
```

---

## Security Considerations

1. **Authentication**: Local credentials with JWT bearer tokens
2. **Authorization**: Verify user ID matches game creator before accepting answers
3. **Rate Limiting**: Limit API calls per IP address
4. **Input Validation**: Validate all country IDs and question types
5. **SQL Injection**: Use Prisma parameterized queries
6. **CORS**: Restrict to frontend domain
7. **Timestamps**: Server-side validation of game duration (prevent timer spoofing)

---

## Performance Optimization

1. **Map Optimization**:
   - Use React.memo for Country components
   - Virtual rendering for many countries
   - Preload SVG paths

2. **API Optimization**:
   - Cache leaderboards for current month
   - Pre-calculate rankings nightly
   - Use Redis for active game sessions (optional)

3. **Bundle Optimization**:
   - Code splitting by page
   - Tree shaking unused components
   - Image optimization via Next.js

4. **Database Optimization**:
   - Indexes on frequently queried columns
   - Denormalize leaderboard data if needed
   - Batch inserts for bulk data

---

## Deployment Strategy

### Environment Stages
- **Development**: Local Next.js dev server + local/cloud PostgreSQL
- **Staging**: Vercel preview deployment
- **Production**: Vercel deployment + managed PostgreSQL

### Database Migration
- Use Prisma migrations for schema changes
- Keep backward compatibility where possible
- Test migrations on staging first

### Monitoring
- Vercel Analytics for performance
- Database query logging
- Error tracking via Sentry (optional)

---

## Scalability Notes

### Current Architecture
- Single Next.js deployment on Vercel
- Shared PostgreSQL database
- No caching layer

### Future Improvements (if needed)
- Redis caching for leaderboards
- Database connection pooling
- Read replicas for leaderboard queries
- CDN for flag images
- Microservice architecture (if player base grows significantly)

---

## Architecture Version

**Version**: 2.0 (Simplified)
**Date**: 2026-07-10
**Status**: Ready for Implementation
