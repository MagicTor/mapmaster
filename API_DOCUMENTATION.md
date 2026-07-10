# MapMaster API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require Clerk authentication (JWT in Authorization header).

---

## Game Endpoints

### 1. Create Game
**POST** `/games/create`

Start a new game (Practice or Challenge mode).

**Request Body:**
```json
{
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "mode": "challenge"
}
```

**Valid Regions:**
- North America
- South America
- Asia
- Europe
- Oceania
- Africa
- World

**Valid Question Types:**
- countries
- capitals
- flags

**Response:**
```json
{
  "gameId": "abc123def456...",
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "mode": "challenge",
  "totalCountries": 47,
  "countries": [
    {
      "id": "DE",
      "name": "Germany",
      "capital": "Berlin",
      "region": "Europe",
      "flagUrl": "https://flagcdn.com/w320/de.png"
    }
  ]
}
```

---

### 2. Submit Answer
**POST** `/games/:id/submit`

Submit a single answer during gameplay.

**Request Body:**
```json
{
  "countryId": "DE",
  "questionType": "countries"
}
```

**Response:**
```json
{
  "correct": true,
  "message": "Correct! Germany identified.",
  "nextQuestion": {
    "type": "capitals",
    "prompt": "Find Berlin",
    "flagUrl": null
  }
}
```

---

### 3. Complete Game
**POST** `/games/:id/complete`

Finalize game and save result (Challenge mode only).

**Request Body:**
```json
{
  "successful": true,
  "livesRemaining": 2,
  "incorrectGuesses": 3,
  "completedAt": "2024-07-15T14:30:00Z"
}
```

**Response:**
```json
{
  "gameId": "abc123def456...",
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "successful": true,
  "livesRemaining": 2,
  "incorrectGuesses": 3,
  "completedAt": "2024-07-15T14:30:00Z",
  "score": 1250,
  "leaderboardRank": 8,
  "totalQualifiedPlayers": 421,
  "message": "Challenge completed! You rank #8 globally."
}
```

---

### 4. Get Game Status
**GET** `/games/:id`

Retrieve current game state.

**Response:**
```json
{
  "gameId": "abc123def456...",
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "mode": "challenge",
  "started": true,
  "startedAt": "2024-07-15T14:00:00Z",
  "currentLives": 2,
  "incorrectGuesses": 3,
  "countriesCompleted": 45,
  "totalCountries": 47
}
```

---

## Leaderboard Endpoints

### 5. Get Leaderboard
**GET** `/leaderboards/:region/:combo?month=7&year=2024`

Fetch rankings for specific region + question combo combination + month.

**Parameters:**
- `:region` - Region name (URL encoded)
- `:combo` - Question types combo (hyphen-separated: `countries-capitals-flags`)
- `?month` - Optional, defaults to current month (1-12)
- `?year` - Optional, defaults to current year

**Examples:**
```
GET /leaderboards/Europe/countries
GET /leaderboards/Europe/countries-capitals?month=7&year=2024
GET /leaderboards/World/capitals-countries-flags?month=12
```

**Response:**
```json
{
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "month": 7,
  "year": 2024,
  "entries": [
    {
      "rank": 1,
      "userId": "user123",
      "username": "GeoMaster",
      "livesRemaining": 3,
      "incorrectGuesses": 0,
      "completedAt": "2024-07-01T10:30:00Z"
    },
    {
      "rank": 2,
      "userId": "user456",
      "username": "EuropeExpert",
      "livesRemaining": 3,
      "incorrectGuesses": 2,
      "completedAt": "2024-07-02T15:45:00Z"
    }
  ]
}
```

---

### 6. Get User Ranking
**GET** `/leaderboards/:region/:combo/user/:userId?month=7&year=2024`

Get specific user's rank in a leaderboard.

**Response:**
```json
{
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "month": 7,
  "year": 2024,
  "user": {
    "id": "user123",
    "username": "GeoMaster",
    "displayName": "Geo Master"
  },
  "rank": 1,
  "totalPlayers": 421,
  "stats": {
    "livesRemaining": 3,
    "incorrectGuesses": 0,
    "completedAt": "2024-07-01T10:30:00Z"
  }
}
```

---

## Statistics Endpoints

### 7. Get User Stats
**GET** `/stats/user/:userId?region=Europe&combo=countries-capitals`

Get user statistics for a specific region+combo or overall.

**Optional Parameters:**
- `?region` - Filter by region
- `?combo` - Filter by question combo (hyphen-separated)

**Response (with region/combo filter):**
```json
{
  "user": {
    "id": "user123",
    "username": "GeoMaster",
    "displayName": "Geo Master"
  },
  "region": "Europe",
  "questionTypes": ["countries", "capitals"],
  "currentMonth": 7,
  "currentYear": 2024,
  "stats": {
    "totalCompletions": 15,
    "monthlyCompletions": 8,
    "bestResult": {
      "livesRemaining": 3,
      "incorrectGuesses": 0,
      "completedAt": "2024-07-01T10:30:00Z"
    },
    "lastCompletion": {
      "livesRemaining": 2,
      "incorrectGuesses": 5,
      "completedAt": "2024-07-14T18:20:00Z"
    }
  }
}
```

**Response (overall stats):**
```json
{
  "user": {
    "id": "user123",
    "username": "GeoMaster",
    "displayName": "Geo Master",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "stats": {
    "totalChallengesCompleted": 156,
    "averageLivesRemaining": "2.45",
    "averageIncorrectGuesses": "3.82",
    "bestPerformance": {
      "livesRemaining": 3,
      "incorrectGuesses": 0,
      "completedAt": "2024-07-01T10:30:00Z"
    }
  }
}
```

---

## Data Endpoints

### 8. Get Countries by Region
**GET** `/data/countries/:region`

Fetch all countries in a region with their metadata.

**Response:**
```json
{
  "region": "Europe",
  "count": 47,
  "countries": [
    {
      "id": "DE",
      "name": "Germany",
      "capital": "Berlin",
      "iso2": "DE",
      "iso3": "DEU",
      "flagUrl": "https://flagcdn.com/w320/de.png",
      "svgPath": "M... (SVG path data)"
    }
  ]
}
```

---

### 9. Get Flag for Country
**GET** `/data/flags/:countryId`

Get flag image URL for a specific country.

**Parameters:**
- `:countryId` - ISO 3166-1 alpha-2 code (e.g., DE, US, FR)

**Response:**
```json
{
  "countryId": "DE",
  "countryName": "Germany",
  "iso2": "DE",
  "flagUrl": "https://flagcdn.com/w320/de.png"
}
```

---

## Ranking Algorithm

Challenge completions are ranked by:

1. **Most Lives Remaining** (primary)
2. **Fewest Incorrect Guesses** (secondary)
3. **Earliest Completion Date** (tertiary, oldest first)

Example ranking:
```
Rank 1: 3 lives, 0 incorrect, 2024-07-01
Rank 2: 3 lives, 2 incorrect, 2024-07-02
Rank 3: 2 lives, 1 incorrect, 2024-07-01
Rank 4: 2 lives, 3 incorrect, 2024-07-03
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message describing the problem",
  "status": 400
}
```

**Common status codes:**
- `400` - Bad request (invalid parameters)
- `401` - Unauthorized (missing auth)
- `404` - Not found (game/user/leaderboard not found)
- `500` - Server error

---

## Rate Limiting

Currently none. Consider implementing:
- 100 requests/minute per user for game submissions
- 1000 requests/minute per user for data queries
