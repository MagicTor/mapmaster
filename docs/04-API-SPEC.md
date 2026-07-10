# API Specification

## Base URL

```
https://countries-of-the-world.vercel.app/api
```

All endpoints return JSON and support CORS.

---

## Authentication

All endpoints except `/data/*` require authentication via Clerk JWT token in `Authorization` header.

```
Authorization: Bearer <clerk_jwt_token>
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

**Common Error Codes**:
- `UNAUTHORIZED` - Missing or invalid auth token
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request data
- `VALIDATION_ERROR` - Input validation failed
- `CONFLICT` - Resource already exists

---

## Endpoints

### Games

#### POST /games/create

Create a new game session.

**Authorization**: Required

**Request**:
```json
{
  "region": "Europe",
  "questionTypes": ["countries", "flags"],
  "mode": "challenge"
}
```

**Fields**:
- `region` (string, required): One of the 7 regions
- `questionTypes` (string[], required): Array of 1-3 types
  - Valid values: "countries", "cities", "flags"
- `mode` (string, required): "practice" or "challenge"

**Response**:
```json
{
  "success": true,
  "data": {
    "gameId": "uuid-1234",
    "region": "Europe",
    "mode": "challenge",
    "questionTypes": ["countries", "flags"],
    "totalCountries": 47,
    "firstQuestion": {
      "id": "q-1",
      "countryId": "de",
      "type": "countries",
      "prompt": "Find Germany"
    }
  }
}
```

**Status Codes**:
- `201` - Game created successfully
- `400` - Invalid region or question types
- `401` - Unauthorized

---

#### POST /games/:gameId/submit

Submit an answer to the current question.

**Authorization**: Required

**Path Parameters**:
- `gameId` (string): Game ID from create endpoint

**Request**:
```json
{
  "countryId": "de",
  "timestamp": 1234567890
}
```

**Fields**:
- `countryId` (string): Country ID (ISO 2-letter code)
- `timestamp` (number): Client timestamp for verification

**Response**:
```json
{
  "success": true,
  "data": {
    "correct": true,
    "feedbackType": "correct",
    "nextQuestion": {
      "id": "q-2",
      "countryId": "fr",
      "type": "flags",
      "prompt": "Find [Flag Image]",
      "flagUrl": "https://..."
    },
    "gameState": {
      "answeredCount": 2,
      "totalCount": 47,
      "livesRemaining": 3,
      "incorrectGuesses": 0,
      "status": "in_progress"
    }
  }
}
```

**Status Codes**:
- `200` - Answer processed
- `400` - Invalid country ID or game ID
- `401` - Unauthorized
- `404` - Game not found
- `410` - Game already ended

---

#### POST /games/:gameId/complete

End the game and save results.

**Authorization**: Required

**Path Parameters**:
- `gameId` (string): Game ID

**Request**:
```json
{
  "reason": "completed",
  "livesRemaining": 2,
  "incorrectGuesses": 3
}
```

**Fields**:
- `reason` (string): "completed", "lives_lost", or "quit"
- `livesRemaining` (number): Lives remaining at end (0-3)
- `incorrectGuesses` (number): Total incorrect guesses during game

**Response**:
```json
{
  "success": true,
  "data": {
    "gameId": "uuid-1234",
    "mode": "challenge",
    "successful": true,
    "livesRemaining": 2,
    "incorrectGuesses": 3,
    "region": "Europe",
    "questionTypes": ["countries", "flags"],
    "completedAt": "2026-07-10T15:30:00Z",
    "results": {
      "totalCountries": 47,
      "correctAnswers": 47,
      "totalQuestions": 94
    }
  }
}
```

**Notes**:
- If mode is "practice", results are not saved to leaderboard
- If mode is "challenge", results are saved only if successful is true
- Server validates lives remaining and incorrect guess count
- Timer is not involved; game ends when lives are lost or all countries found

**Status Codes**:
- `200` - Game completed and results processed
- `201` - Game completed and leaderboard entry created (Challenge mode only)
- `400` - Invalid game state
- `401` - Unauthorized
- `404` - Game not found

---

#### GET /games/:gameId

Get current game state.

**Authorization**: Required

**Path Parameters**:
- `gameId` (string): Game ID

**Response**:
```json
{
  "success": true,
  "data": {
    "gameId": "uuid-1234",
    "region": "Europe",
    "mode": "challenge",
    "questionTypes": ["countries", "flags"],
    "status": "in_progress",
    "startedAt": "2026-07-10T15:00:00Z",
    "livesRemaining": 3,
    "incorrectGuesses": 0,
    "answeredCountries": ["de", "fr", "it"],
    "totalCountries": 47,
    "currentQuestion": {
      "id": "q-3",
      "countryId": "es",
      "type": "countries",
      "prompt": "Find Spain"
    }
  }
}
```

**Status Codes**:
- `200` - Game state retrieved
- `401` - Unauthorized
- `404` - Game not found

---

### Leaderboards

#### GET /leaderboards/:region/:combo

Get leaderboard for region + question type combo (current month).

**Authorization**: Optional (can be anonymous)

**Path Parameters**:
- `region` (string): Region name
- `combo` (string): Question type combo (url-encoded)
  - Examples: "countries", "countries+flags", "countries+cities+flags"

**Query Parameters**:
- `month` (number, optional): Month (1-12), defaults to current
- `year` (number, optional): Year, defaults to current
- `limit` (number, optional): Max results (1-100), defaults to 50
- `offset` (number, optional): Pagination offset, defaults to 0

**Response**:
```json
{
  "success": true,
  "data": {
    "region": "Europe",
    "questionTypes": ["countries"],
    "month": 7,
    "year": 2026,
    "totalPlayers": 421,
    "entries": [
      {
        "rank": 1,
        "userId": "user-123",
        "username": "geoguru",
        "displayName": "Geography Guru",
        "livesRemaining": 3,
        "incorrectGuesses": 0,
        "completedAt": "2026-07-10T12:30:00Z"
      },
      {
        "rank": 2,
        "userId": "user-456",
        "username": "mapmaster",
        "displayName": "Map Master",
        "livesRemaining": 3,
        "incorrectGuesses": 2,
        "completedAt": "2026-07-10T14:15:00Z"
      }
    ]
  }
}
```

**Status Codes**:
- `200` - Leaderboard retrieved
- `400` - Invalid region or combo
- `404` - No leaderboard found (no completions yet)

---

#### GET /leaderboards/:region/:combo/user/:userId

Get user's rank and stats for specific leaderboard.

**Authorization**: Optional

**Path Parameters**:
- `region` (string): Region name
- `combo` (string): Question type combo (url-encoded)
- `userId` (string): User ID

**Query Parameters**:
- `month` (number, optional): Month (1-12), defaults to current
- `year` (number, optional): Year, defaults to current

**Response**:
```json
{
  "success": true,
  "data": {
    "region": "Europe",
    "questionTypes": ["countries"],
    "month": 7,
    "year": 2026,
    "rank": 8,
    "totalPlayers": 421,
    "best": {
      "livesRemaining": 3,
      "incorrectGuesses": 0,
      "completedAt": "2026-07-10T15:30:00Z"
    },
    "recent": {
      "livesRemaining": 2,
      "incorrectGuesses": 1,
      "completedAt": "2026-07-10T16:45:00Z"
    }
  }
}
```

**Status Codes**:
- `200` - User rank retrieved
- `400` - Invalid parameters
- `404` - User has no entries on this leaderboard

---

### Statistics

#### GET /stats/user/:userId

Get user's stats across all regions and combos for current month.

**Authorization**: Required for own user, optional for others

**Path Parameters**:
- `userId` (string): User ID

**Query Parameters**:
- `month` (number, optional): Month (1-12), defaults to current
- `year` (number, optional): Year, defaults to current

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "month": 7,
    "year": 2026,
    "summary": {
      "totalCompletions": 45,
      "totalRegions": 5,
      "totalCombos": 3
    },
    "byRegion": [
      {
        "region": "Europe",
        "completions": 12,
        "combos": [
          {
            "questionTypes": ["countries"],
            "completions": 4,
            "bestLives": 3,
            "bestIncorrectGuesses": 0,
            "rank": 8,
            "totalPlayers": 421
          },
          {
            "questionTypes": ["countries", "flags"],
            "completions": 8,
            "bestLives": 2,
            "bestIncorrectGuesses": 1,
            "rank": 12,
            "totalPlayers": 215
          }
        ]
      }
    ]
  }
}
```

**Status Codes**:
- `200` - Stats retrieved
- `400` - Invalid parameters
- `404` - User not found

---

### Data (No Authentication)

#### GET /data/countries/:region

Get countries for a specific region.

**Authorization**: Not required

**Path Parameters**:
- `region` (string): Region name

**Response**:
```json
{
  "success": true,
  "data": {
    "region": "Europe",
    "countries": [
      {
        "id": "de",
        "name": "Germany",
        "capital": "Berlin",
        "flagUrl": "https://...",
        "svgPath": "M 10,10 L 20,20..."
      }
    ],
    "count": 47
  }
}
```

**Status Codes**:
- `200` - Countries retrieved
- `400` - Invalid region

---

#### GET /data/flags/:countryId

Get flag image for a country.

**Authorization**: Not required

**Path Parameters**:
- `countryId` (string): ISO 2-letter country code

**Response**: Redirects to flag image URL (HTTP 301)

**Status Codes**:
- `301` - Redirect to flag URL
- `404` - Country not found

---

## Rate Limiting

All endpoints are rate limited:

- **Authenticated endpoints**: 100 requests per minute per user
- **Public endpoints**: 200 requests per minute per IP
- **Response headers**:
  - `X-RateLimit-Limit`: Requests allowed in window
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp of reset

---

## Error Examples

### Missing Authentication
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token required"
  }
}
```

### Invalid Region
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid region: 'InvalidRegion'. Valid regions: North America, South America, Asia, Europe, Oceania, Africa, World"
  }
}
```

### Game Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Game 'uuid-not-exist' not found or has ended"
  }
}
```

---

## Pagination

Leaderboard results use offset-based pagination:

```
GET /leaderboards/Europe/countries?limit=50&offset=50
```

- `limit`: Results per page (1-100, default 50)
- `offset`: Starting position (default 0)

---

## Sorting

Leaderboards are always sorted by:
1. Completion time (ascending)
2. Lives remaining (descending)
3. Timestamp (ascending)

No custom sorting is available.

---

## Caching

- Public data endpoints (countries, flags) can be cached for 1 hour
- Leaderboards can be cached for 5 minutes
- User-specific endpoints should not be cached

---

## API Version

**Version**: 2.0 (Simplified)
**Date**: 2026-07-10
**Status**: Ready for Implementation
