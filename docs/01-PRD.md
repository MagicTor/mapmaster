# COUNTRIES OF THE WORLD - Product Specification

## Game Overview

A competitive browser-based geography map game where players identify countries by name, capital cities, or flags across different world regions.

### Core Features

- **Question Types**: Countries, Capital Cities, Flags (user-selectable via checkboxes)
- **Playable Regions**: 7 regions with 203 total countries and territories
- **Game Modes**: Practice (unlimited time, unlimited guesses, never saved), Challenge (3 lives, unlimited time, ranked globally)
- **Leaderboards**: Separate ranking for every Region × Question Type Combination × Month
- **Ranking Criteria**: Most lives remaining (primary), then fewest incorrect guesses (secondary)

---

## Game Concept

Players click countries on an interactive map to answer geography questions. Each correct answer fills in the country on the map. The objective is to complete all countries in a region.

**Practice Mode**: Learn at your own pace with no timer, unlimited guesses, and Reveal/Skip buttons.

**Challenge Mode**: Complete all countries before losing 3 lives. No timer—play at your own pace. Results automatically saved to monthly leaderboards.

---

## Regions

| Region | Countries | Notes |
|--------|-----------|-------|
| North America | 24 | Countries & territories |
| South America | 13 | - |
| Asia | 47 | - |
| Europe | 47 | Includes city states |
| Oceania | 17 | Island nations |
| Africa | 55 | - |
| World | 203 | All combined |

---

## Question Types

### Countries
**Format**: "Find [Country Name]"  
**Example**: "Find Germany"

### Capital Cities
**Format**: "Find [City Name]"  
**Example**: "Find Berlin"  
**Note**: Player clicks the country containing that capital

### Flags
**Format**: "Find [Flag Image]"  
**Example**: Display flag image
**Note**: Player clicks the country matching that flag

### Combined Questions
When multiple types are selected, questions are randomly mixed:
- Question 1: Find Germany
- Question 2: Find [Flag Image]
- Question 3: Find Berlin
- etc.

---

## Map Interface

### Visual State

**Before Game Starts**:
- Entire region displayed
- Countries have only border outlines
- No fill colors

**During Game**:
- Unanswered countries: outline only
- Answered (filled) countries: solid color fill

**Visual Feedback**:
- Correct answer: question bar flashes GREEN briefly
- Incorrect answer: question bar flashes RED briefly
- Country becomes filled immediately after correct answer
- Never color incorrect countries red on the map

---

## Practice Mode

**Rules**:
- No timer
- Unlimited guesses per question
- Unlimited mistakes

**Controls**:
- Reveal: Shows correct country and marks it completed
- Skip: Moves to next question without marking country

**Completion**:
- Ends only when all countries in region are filled
- Can be abandoned at any time
- Progress is never saved
- Results never recorded to leaderboards

---

## Challenge Mode

**Timer**: None (Unlimited time)

**Lives**: 3 total
- Each incorrect answer costs 1 life
- Correct answer costs 0 lives
- Game ends when all 3 lives lost OR all countries completed

**Completion**: All countries in region must be filled before all 3 lives are lost

**Successful Completion**: Only counted if all countries filled with at least 1 life remaining

**Result Display**:
- Region Name
- Question Types Used (e.g., "Countries + Flags")
- Countries Completed (e.g., "47 of 47")
- Lives Remaining (1, 2, or 3)
- Incorrect Guesses (total count)
- Completion Date

---

## Leaderboard System

### Segmentation

Separate leaderboards created for each combination of:

1. **Region** (7 options)
2. **Question Types** (7 combinations)
   - Countries Only
   - Cities Only
   - Flags Only
   - Countries + Cities
   - Countries + Flags
   - Cities + Flags
   - Countries + Cities + Flags
3. **Month** (rolling 12 months)

**Total Possible Leaderboards**: 7 regions × 7 combinations × 12 months = 588 leaderboards

### Data Recorded

Only Challenge Mode completions are recorded:

- Player ID
- Region
- Question Type Combination
- Lives Remaining
- Incorrect Guesses
- Month / Year
- Timestamp

### Ranking Order

1. **Primary**: Most Lives Remaining (descending)
2. **Secondary**: Fewest Incorrect Guesses (ascending)
3. **Tiebreaker**: Earlier completion date (ascending)

---

## Region Pages

When user selects a region, display:

### Header
Region name + 3 buttons:
- Practice
- Challenge
- Leaderboard

### Statistics Section

For each question type combination (7 total):

**If no completions this month**:
```
Countries Only

Not Yet Completed This Month
```

**If completions exist**:
```
Countries Only

Last Challenge:
2 Lives Remaining

Best This Month:
3 Lives Remaining

Current Rank:
#8 of 421 Players
```

Display all 7 combinations in grid or list format.

---

## Game Flow

### 1. Homepage
Title: "COUNTRIES OF THE WORLD"
Display 7 region selection buttons

### 2. Region Selection
User selects region → loads region page

### 3. Region Page
Displays statistics for all 7 question type combinations
Shows Practice / Challenge / Leaderboard buttons

### 4. Mode/Type Selection
User clicks Practice or Challenge
Checkbox dialog appears:
- ☐ Countries
- ☐ Cities  
- ☐ Flags

At least one must be selected.

### 5. Game Start
Map loads with selected region
First question displays
User begins answering

### 6. Game End
**Practice**: User fills all countries, clicks end/close
**Challenge**: All 3 lives lost (failure) OR all countries filled with at least 1 life remaining (success)

### 7. Results Screen
Display:
- Lives Remaining (1, 2, or 3)
- Incorrect Guesses (total count)
- Countries Completed / Total
- Region Name
- Question Types Used
- Completion Date

If Challenge was successful:
- Show leaderboard position
- Option to view full leaderboard
- "Share Result" button (optional)

If Challenge failed:
- "Retry" button
- "Change Mode" button

---

## Question Selection Algorithm

**Shuffling**:
1. Get all countries in region
2. Randomize order each game
3. For each country, create question based on enabled types

**Mixed Types** (if multiple selected):
1. Create question pool: countries × types
2. Shuffle question pool
3. Deliver questions in shuffled order

**Example**: Africa (55 countries) + Countries + Flags selected:
- 55 questions total
- ~27-28 about countries
- ~27-28 about flags
- In random order

---

## No Additional Systems

This game deliberately excludes:

❌ Difficulty levels
❌ XP or progression
❌ Leveling system
❌ Achievements
❌ Cosmetics or unlocks
❌ Daily rewards
❌ Streak systems
❌ Hints (except Reveal in Practice)
❌ Player ranks or titles
❌ Alternative game rules

The focus is purely competitive: **Who's fastest?**

---

## Geographic Data

### Countries Required

Complete list of:
- Official country names
- Capital city names
- Country ISO codes (for ID)
- SVG map paths (for clickable regions)
- Regional assignment
- Flag image URLs

All 203 countries and territories across all 7 regions must be included.

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

Responsive design for all screen sizes.

---

## Deployment Target

- Frontend: Vercel
- Backend: Node.js API
- Database: PostgreSQL
- Authentication: Clerk or similar

---

## Document Version

**Version**: 2.0 (Redesigned)
**Date**: 2026-07-10
**Status**: Ready for Implementation
