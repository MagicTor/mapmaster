# Database Schema

## Overview

Simplified database design optimized for competitive geography gameplay. Only Challenge mode results are stored; Practice mode has no persistence.

---

## Tables

### User

Stores user account information. Authentication is handled by Clerk.

```sql
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  clerkId TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  displayName TEXT,
  avatar TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clerk_id ON "User"(clerkId);
CREATE INDEX idx_email ON "User"(email);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `clerkId`: Clerk authentication ID
- `email`: User email address
- `username`: Optional display username
- `displayName`: Optional full name
- `avatar`: Optional profile image URL
- `createdAt`: Account creation timestamp
- `updatedAt`: Last updated timestamp

---

### Country

Stores geographic data for all countries and territories.

```sql
CREATE TABLE "Country" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  capital TEXT NOT NULL,
  region TEXT NOT NULL,
  flagUrl TEXT,
  svgPath TEXT NOT NULL,
  iso2 TEXT,
  iso3 TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_region ON "Country"(region);
CREATE INDEX idx_name ON "Country"(name);
```

**Fields**:
- `id`: ISO 3166-1 alpha-2 code (e.g., "de" for Germany)
- `name`: Official country name
- `capital`: Capital city name
- `region`: Region assignment (North America, South America, Asia, Europe, Oceania, Africa, World)
- `flagUrl`: URL to flag image
- `svgPath`: SVG path data for map clickability
- `iso2`: ISO 3166-1 alpha-2 code (duplicate of id for clarity)
- `iso3`: ISO 3166-1 alpha-3 code
- `createdAt`: Record creation timestamp

---

### ChallengeResult

Records every successful Challenge mode completion. Practice mode results are never stored.

```sql
CREATE TABLE "ChallengeResult" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  region TEXT NOT NULL,
  questionTypes TEXT NOT NULL,
  livesRemaining INT NOT NULL (1-3),
  incorrectGuesses INT NOT NULL,
  successful BOOLEAN NOT NULL DEFAULT false,
  completedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  INDEX idx_user_id ON "ChallengeResult"(userId),
  INDEX idx_region ON "ChallengeResult"(region),
  INDEX idx_question_types ON "ChallengeResult"(questionTypes),
  INDEX idx_leaderboard ON "ChallengeResult"(region, questionTypes, livesRemaining, incorrectGuesses, completedAt),
  INDEX idx_month ON "ChallengeResult"(YEAR(completedAt), MONTH(completedAt))
);
```

**Fields**:
- `id`: Unique record ID (UUID)
- `userId`: Foreign key to User
- `region`: Region name (North America, South America, Asia, Europe, Oceania, Africa, World)
- `questionTypes`: JSON string or comma-separated list of selected types
  - Examples: `"countries"`, `"flags"`, `"countries,flags"`, `"countries,cities,flags"`
- `livesRemaining`: Lives remaining at completion (1, 2, or 3)
- `incorrectGuesses`: Total incorrect answers given during the game
- `successful`: Whether challenge was completed with at least 1 life remaining
- `completedAt`: Timestamp of completion

**Notes**:
- Only `successful = true` entries count for leaderboards
- Monthly leaderboards are generated from `completedAt` year/month

---

### Optional: LeaderboardCache

Pre-calculated leaderboards for performance. Can be regenerated nightly.

```sql
CREATE TABLE "LeaderboardCache" (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  questionTypes TEXT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  rank INT NOT NULL,
  userId TEXT NOT NULL,
  livesRemaining INT NOT NULL,
  incorrectGuesses INT NOT NULL,
  completedAt TIMESTAMP NOT NULL,
  totalPlayers INT NOT NULL,
  lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES "User"(id),
  UNIQUE KEY cache_key (region, questionTypes, month, year, rank),
  INDEX idx_user_rank ON "LeaderboardCache"(userId, region, questionTypes, month, year)
);
```

**Notes**:
- Generated automatically from ChallengeResult table
- Used for fast leaderboard queries
- Regenerated daily or on-demand

---

## Prisma Schema File

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  clerkId       String    @unique
  email         String    @unique
  username      String?   @unique
  displayName   String?
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  challengeResults ChallengeResult[]

  @@map("User")
}

model Country {
  id        String   @id
  name      String   @unique
  capital   String
  region    String
  flagUrl   String?
  svgPath   String
  iso2      String?
  iso3      String?
  createdAt DateTime @default(now())

  @@index([region])
  @@index([name])
  @@map("Country")
}

model ChallengeResult {
  id                String   @id @default(cuid())
  userId            String
  region            String
  questionTypes     String   // JSON: ["countries"] or ["countries","flags"]
  livesRemaining    Int      // 1, 2, 3
  incorrectGuesses  Int      // Total incorrect answers
  successful        Boolean  @default(false)
  completedAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([region])
  @@index([questionTypes])
  @@index([region, questionTypes, livesRemaining, incorrectGuesses, completedAt])
  @@index([completedAt])
  @@map("ChallengeResult")
}

model LeaderboardCache {
  id               String   @id @default(cuid())
  region           String
  questionTypes    String
  month            Int
  year             Int
  rank             Int
  userId           String
  livesRemaining   Int
  incorrectGuesses Int
  completedAt      DateTime
  totalPlayers     Int
  lastUpdated      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([region, questionTypes, month, year, rank])
  @@index([userId, region, questionTypes, month, year])
  @@map("LeaderboardCache")
}
```

---

## Data Relationships

```
User (1) ──→ (Many) ChallengeResult
User (1) ──→ (Many) LeaderboardCache

ChallengeResult includes:
- userId: References User
- region: Matches Country.region
- questionTypes: Types of questions asked
- completedAt: Determines which monthly leaderboard

Country:
- Independent table
- No foreign keys
- Referenced by frontend for map rendering
```

---

## Leaderboard Logic

### Segmentation
Leaderboards are determined by three factors:

1. **Region** (7 options):
   - North America, South America, Asia, Europe, Oceania, Africa, World

2. **Question Types** (7 combinations):
   - countries
   - cities
   - flags
   - countries,cities
   - countries,flags
   - cities,flags
   - countries,cities,flags

3. **Month** (from completedAt):
   - Year 2026, Month 1-12
   - Year 2026, Month 1-12
   - etc.

### Ranking Algorithm

```sql
SELECT
  RANK() OVER (
    ORDER BY livesRemaining DESC,
             incorrectGuesses ASC,
             completedAt ASC
  ) as rank,
  userId,
  livesRemaining,
  incorrectGuesses,
  completedAt
FROM ChallengeResult
WHERE
  region = $1
  AND questionTypes = $2
  AND YEAR(completedAt) = $3
  AND MONTH(completedAt) = $4
  AND successful = true
ORDER BY rank;
```

**Ranking Order**:
1. Most livesRemaining (descending)
2. Fewest incorrectGuesses (ascending)
3. Earliest completedAt (ascending) - tiebreaker

---

## Queries

### Get Leaderboard for Specific Month

```sql
SELECT
  ROW_NUMBER() OVER (
    ORDER BY r.livesRemaining DESC,
             r.incorrectGuesses ASC,
             r.completedAt ASC
  ) as rank,
  u.id,
  u.username,
  u.displayName,
  r.livesRemaining,
  r.incorrectGuesses,
  r.completedAt
FROM ChallengeResult r
JOIN User u ON r.userId = u.id
WHERE
  r.region = ?
  AND r.questionTypes = ?
  AND YEAR(r.completedAt) = ?
  AND MONTH(r.completedAt) = ?
  AND r.successful = true
ORDER BY rank
LIMIT 100;
```

### Get User's Best Score for Combo This Month

```sql
SELECT
  livesRemaining,
  incorrectGuesses,
  completedAt
FROM ChallengeResult
WHERE
  userId = ?
  AND region = ?
  AND questionTypes = ?
  AND YEAR(completedAt) = ?
  AND MONTH(completedAt) = ?
  AND successful = true
ORDER BY livesRemaining DESC, incorrectGuesses ASC
LIMIT 1;
```

### Get User's Rank in Specific Leaderboard

```sql
SELECT
  COUNT(*) + 1 as rank,
  (
    SELECT COUNT(DISTINCT userId)
    FROM ChallengeResult
    WHERE
      region = ?
      AND questionTypes = ?
      AND YEAR(completedAt) = ?
      AND MONTH(completedAt) = ?
      AND successful = true
  ) as totalPlayers
FROM ChallengeResult
WHERE
  region = ?
  AND questionTypes = ?
  AND YEAR(completedAt) = ?
  AND MONTH(completedAt) = ?
  AND successful = true
  AND (livesRemaining > ? OR (livesRemaining = ? AND incorrectGuesses < ?))
```

---

## Data Seeding

### Countries Seed Data

Must include all 203 countries/territories with:
- Country ID (ISO 2-letter code)
- Country name
- Capital city
- Region assignment
- Flag image URL
- SVG path for map

Sources:
- https://restcountries.com/v3.1/all
- https://wikipedia.org/wiki/List_of_countries_and_dependencies
- OpenStreetMap for SVG paths

### Initial Users

None required - users created via Clerk authentication.

---

## Indexes

Strategic indexes for query performance:

| Table | Index | Purpose |
|-------|-------|---------|
| User | clerkId | Authentication lookups |
| User | email | Email-based queries |
| Country | region | Get countries by region |
| ChallengeResult | userId | User's game history |
| ChallengeResult | region, questionTypes, completedAt | Leaderboard queries |
| ChallengeResult | completedAt | Monthly queries |

---

## Database Version

**Version**: 2.0 (Simplified)
**Date**: 2026-07-10
**Status**: Ready for Implementation
