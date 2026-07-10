# COUNTRIES OF THE WORLD - Correction Summary

**Date**: 2026-07-10 14:33 UTC  
**Status**: Correction Applied - Documentation Updated

---

## What Changed

The game mechanics have been fundamentally corrected from a **time-based competitive game** to an **accuracy-based competitive game**.

### Before (Initial Redesign)
- ⏱️ Challenge Mode: 3-second timer
- 🎯 Ranking: Fastest completion time (primary) → Most lives remaining (secondary)
- ⏱️ StatusBar showed: Timer countdown
- 📊 Leaderboards displayed: Completion time in MM:SS.SSS format

### After (Corrected Design)
- ✅ Challenge Mode: NO TIMER (unlimited time)
- 🎯 Ranking: Most lives remaining (primary) → Fewest incorrect guesses (secondary) → Earliest completion date (tertiary)
- ✅ StatusBar shows: Incorrect guess counter
- 📊 Leaderboards display: Lives remaining + incorrect guesses count

---

## Documentation Updates Applied

### 01-PRD.md
✅ **Challenge Mode Section** (Lines 66-84)
- Removed: "Timer: 3000 milliseconds total (exactly 3 seconds)"
- Added: "Timer: None (Unlimited time)"
- Updated: Lives/timeout end conditions

✅ **Question Types Section** (Lines 34-56)
- Changed format from "Click Germany" → "Find Germany"
- Changed format from "Which country has capital Berlin?" → "Find Berlin"
- Changed format from "Identify this country" → "Find [Flag Image]"

✅ **Region Statistics Display** (Lines 107-127)
- Removed: Completion time fields
- Added: "Lives Remaining" and "Incorrect Guesses" fields

✅ **Leaderboard Ranking Order** (Line 114-116)
- Changed primary sort from completion time to lives remaining
- Added secondary sort by incorrect guesses
- Added tertiary sort by completion date

### 03-DATABASE.md
✅ **ChallengeResult SQL Table** (Lines 82-98)
- Removed: `completionTimeMs INT` column
- Added: `incorrectGuesses INT` column
- Updated indexes to sort by lives/incorrect guesses instead of time

✅ **Prisma Schema Model** (Lines 195-213)
- Removed: `completionTimeMs` field
- Added: `incorrectGuesses` field
- Updated index composition

✅ **LeaderboardCache Model** (Lines 215-234)
- Removed: `completionTimeMs` field
- Added: `incorrectGuesses` field

✅ **Ranking Algorithm Query** (Lines 283-302)
```sql
-- OLD
ORDER BY completionTimeMs ASC,
         livesRemaining DESC,
         completedAt ASC

-- NEW
ORDER BY livesRemaining DESC,
         incorrectGuesses ASC,
         completedAt ASC
```

✅ **Example Queries** (Lines 314-380)
- Updated "Get Best Score" query to sort by lives then incorrect guesses
- Updated "Get User's Rank" query with new ranking criteria

### 04-API-SPEC.md
✅ **POST /games/create Response** (Lines 84-97)
- Removed: `"timerDurationMs": 3000`
- Removed: `"prompt": "Click Germany"` examples
- Added: `"prompt": "Find Germany"` format

✅ **POST /games/:gameId/submit Response** (Lines 129-152)
- Removed: `"timeRemainingMs": 2800`
- Added: `"incorrectGuesses": 0`
- Updated prompt example

✅ **POST /games/:gameId/complete Request/Response** (Lines 171-205)
- Removed: `"timeElapsedMs": 154320`
- Added: `"incorrectGuesses": number`
- Removed: `"completionTimeMs": 154320` from response
- Added: `"incorrectGuesses": 3` to response
- Removed: "timeout" reason option

✅ **GET /games/:gameId Response** (Lines 231-254)
- Removed: `"timeRemainingMs": 2500`
- Added: `"incorrectGuesses": 0`
- Updated prompt format

✅ **Leaderboard Responses** (Multiple sections)
- Removed: `"completionTimeMs"` fields in all leaderboard entries
- Added: `"incorrectGuesses"` fields
- Updated examples to show new ranking order

✅ **Statistics Response** (Lines 398-424)
- Removed: `"bestTime": 154320` fields
- Added: `"bestIncorrectGuesses": 0` fields
- Removed time-based comparisons

### 05-COMPONENTS.md
✅ **RegionPage Statistics Display** (Lines 62-84)
- Changed from: "Best: 02:45.320  3 Lives"
- Changed to: "Best: 3 Lives, 0 Incorrect"

✅ **GamePage StatusBar Display** (Lines 110-125)
- Removed: "Timer: 02:45"
- Added: "Incorrect: 0"

✅ **GamePage StatusBar Component** (Lines 277-294)
- Removed: `timeRemainingMs` prop
- Added: `incorrectGuesses` prop

✅ **ResultsPage Success Layout** (Lines 152-169)
- Removed: "Time: 02:45.320"
- Added: "Incorrect: 1 Guess"

✅ **ResultsPage Failure Layout** (Lines 171-185)
- Removed: "Reason: Time Ran Out"
- Added: "Reason: Lives Lost"
- Removed: "Time Elapsed: 03:00.000"
- Added: "Incorrect: 3 Guesses"

✅ **QuestionPrompt Component** (Lines 337-361)
- Updated layout example from "Click Germany" to "Find Germany"

---

## Key Mechanical Changes

### Game Flow Changes

**Correct Answer**:
- ✅ Question bar flashes GREEN
- ✅ Country fills permanently
- ✅ Lives unchanged (-0)
- ✅ Incorrect guess counter unchanged
- ✅ Next question appears

**Incorrect Answer**:
- ❌ Question bar flashes RED
- ❌ Lives decrease by 1
- ❌ Incorrect guess counter increases by 1
- ❌ Country remains unfilled
- ❌ Same question asked again (or moved to next, depends on implementation)

**Game End Conditions**:
- ✅ ALL COUNTRIES FILLED WITH 1+ LIVES = Success
- ❌ All 3 lives lost = Failure
- ❌ NO TIME LIMIT = No timeout failure

### Leaderboard Ranking

**Old Algorithm** (Removed):
```
1. Completion time ascending (fastest = rank 1)
2. Lives remaining descending (if time tied)
3. Completion date ascending (if time+lives tied)
```

**New Algorithm** (Active):
```
1. Lives remaining descending (3 > 2 > 1, so 3 = rank 1)
2. Incorrect guesses ascending (0 < 5, so 0 = rank 1 if lives tied)
3. Completion date ascending (if both tied)

Example:
Player A: 3 Lives, 0 Incorrect = Rank 1
Player B: 3 Lives, 2 Incorrect = Rank 2
Player C: 2 Lives, 0 Incorrect = Rank 3
Player D: 2 Lives, 1 Incorrect = Rank 4
```

### Question Format Standardization

All questions now use consistent "Find [Target]" format:

- **Countries**: "Find Germany"
- **Capital Cities**: "Find Berlin" (player clicks country containing Berlin)
- **Flags**: "Find [Flag Image]" (player clicks country matching flag)

---

## Database Impact

### New Fields Added
- `ChallengeResult.incorrectGuesses` (INTEGER NOT NULL)
- `LeaderboardCache.incorrectGuesses` (INTEGER NOT NULL)

### Fields Removed
- `ChallengeResult.completionTimeMs` (no longer tracked)
- `LeaderboardCache.completionTimeMs` (no longer needed)

### Index Changes
- Old index: `(region, questionTypes, completedAt)` for sorting by time
- New index: `(region, questionTypes, livesRemaining, incorrectGuesses, completedAt)` for new ranking

### Migration Note
If migrating existing data: populate `incorrectGuesses` with 0 for all existing Challenge results.

---

## API Impact

### Endpoint Changes
- No endpoint URL changes
- Request body: Remove `timeElapsedMs`, add `incorrectGuesses`
- Response body: Remove all `completionTimeMs` fields, add `incorrectGuesses` to results
- Query parameters: No changes
- Status codes: No changes

### Response Format Changes
All leaderboard and stats endpoints now show:
```json
{
  "livesRemaining": 3,
  "incorrectGuesses": 0,
  "completedAt": "2026-07-10T15:30:00Z"
}
```

Instead of:
```json
{
  "completionTimeMs": 154320,
  "livesRemaining": 3,
  "completedAt": "2026-07-10T15:30:00Z"
}
```

---

## Frontend Impact

### Component Changes
- **StatusBar**: Remove timer display, add incorrect guess counter
- **QuestionPrompt**: Update all question text to "Find [Target]" format
- **ResultsPage**: Remove completion time, add incorrect guess count
- **LeaderboardTable**: Remove time column, add incorrect guesses column
- **RegionPage**: Update stats display to show lives + incorrect guesses

### Game Logic Changes
- Remove timer initialization and countdown logic
- Add incorrect guess counter and increment logic
- Update game end conditions (remove timeout checks)
- Update ranking logic to sort by lives/incorrect guesses

### Zustand Store Changes
- Remove `timeRemaining` from gameStore
- Add `incorrectGuesses` to gameStore
- Update game state mutations

---

## Testing Implications

### New Test Cases Required
1. Verify game doesn't end when any arbitrary time passes (no timer)
2. Verify incorrect guess counter increments on wrong answer
3. Verify leaderboard sorts correctly by lives → incorrect guesses
4. Verify same player with 3 lives + 0 incorrect guesses ranks above 3 lives + 2 incorrect guesses
5. Verify game ends only when all countries filled OR all 3 lives lost

### Test Data Updates
- Remove time-based assertions
- Add incorrect guess count assertions
- Update leaderboard ranking assertions
- Update mock API responses

---

## Breaking Changes Summary

⚠️ **These are breaking changes from the initial redesign**:

1. **No Timer**: Games can now take indefinite time
2. **Ranking Basis**: Changes from speed-focused to accuracy-focused
3. **Database Schema**: Structure changed (removed time, added incorrect guesses)
4. **API Contracts**: Request/response formats changed
5. **UI Display**: Timer removed, incorrect guess counter added

---

## Files Modified in This Session

| File | Status | Key Changes |
|------|--------|-------------|
| `/docs/01-PRD.md` | ✅ Updated | Challenge mode, question format, ranking order |
| `/docs/03-DATABASE.md` | ✅ Updated | Schema, indexes, ranking queries |
| `/docs/04-API-SPEC.md` | ✅ Updated | All endpoint examples and responses |
| `/docs/05-COMPONENTS.md` | ✅ Updated | StatusBar, ResultsPage, RegionPage displays |
| `/plan.md` | ✅ Updated | Game concept, critical requirements, phases |

---

## Verification Checklist

- ✅ All timer references removed from documentation
- ✅ All "incorrect guesses" fields added to relevant places
- ✅ All "Find [Target]" question format examples updated
- ✅ Leaderboard ranking algorithm corrected
- ✅ Database schema updated
- ✅ API responses updated
- ✅ Component descriptions updated
- ✅ Plan updated with corrected game concept

---

## Next Steps

1. Update Prisma schema file with new fields
2. Create database migration for adding `incorrectGuesses` field
3. Implement incorrect guess tracking in game logic
4. Update all API endpoints to use new ranking logic
5. Update frontend components to remove timer references
6. Update tests to verify new game mechanics
7. Verify leaderboard rankings with new algorithm

---

## Document Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-07-10 10:00 | Superseded | Initial redesign (with timer) |
| 2.1 | 2026-07-10 14:33 | Current | Corrected (untimed, accuracy-based) |

---

## Summary

MapMaster has been corrected from a **fast-paced timed challenge** to a **careful accuracy-focused challenge**. Players are now encouraged to play carefully and maintain lives rather than rushing against the clock. This is a fundamental design shift that makes geography knowledge and strategy more important than reaction speed.

All documentation is now aligned with this corrected vision.
