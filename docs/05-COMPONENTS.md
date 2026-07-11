# Component Specification

## Component Hierarchy

```
App
├── RootLayout
│   ├── Header
│   └── Footer
├── Pages
│   ├── HomePage
│   ├── RegionPage
│   ├── GamePage
│   ├── ResultsPage
│   └── LeaderboardPage
└── Providers (Zustand)
```

---

## Page Components

### HomePage

**Path**: `app/page.tsx`

**Purpose**: Display region selection buttons

**Layout**:
```
┌─────────────────────────────────┐
│         HEADER                  │
├─────────────────────────────────┤
│   COUNTRIES OF THE WORLD        │
│                                 │
│  [ North America ]  [ Europe ]  │
│  [ South America ]  [ Oceania ] │
│  [ Asia ]           [ Africa ]  │
│                 [ World ]       │
└─────────────────────────────────┘
```

**Features**:
- Large title
- 7 region buttons in grid layout
- Navigation to region page on click
- Responsive layout (stack on mobile)

**State**:
- None (static page)

**Props**: None

---

### RegionPage

**Path**: `app/region/[name]/page.tsx`

**Purpose**: Show region statistics and action buttons

**Layout**:
```
┌─────────────────────────────────┐
│        HEADER                   │
├─────────────────────────────────┤
│   Europe                        │
│                                 │
│  [ Practice ] [ Challenge ]     │
│  [ Leaderboard ]                │
│                                 │
│  ─── Monthly Statistics ────    │
│                                 │
│  Countries Only                 │
│  Not Yet Completed This Month   │
│                                 │
│  Countries + Flags              │
│  Best: 3 Lives, 0 Incorrect     │
│  Last: 2 Lives, 1 Incorrect     │
│  Rank: #5 of 342 Players        │
│                                 │
│  [... 5 more combos ...]        │
└─────────────────────────────────┘
```

**Features**:
- Back button to home
- Region name header
- 3 main buttons (Practice, Challenge, Leaderboard)
- Statistics grid for all 7 question type combos
- Shows last completed, best time, rank, total players

**State**:
- Selected region (from URL param)
- Monthly statistics data (fetched from API)

**Props**:
- `params.name`: Region name from URL

---

### GamePage

**Path**: `app/game/[id]/page.tsx`

**Purpose**: Main game playing interface

**Layout**:
```
┌──────────────────────────────────────┐
│   StatusBar                          │
│   Lives: ❤️❤️❤️  Incorrect: 0  [X]   │
├──────────────────────────────────────┤
│                                      │
│          GAME MAP                    │
│   (Interactive SVG with countries)   │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Question Bar                        │
│  Find Germany                        │
│                                      │
│ (Practice: [ Reveal ] [ Skip ] )     │
└──────────────────────────────────────┘
```

**Features**:
- Interactive map component
- Status bar with lives and incorrect guess count
- Question prompt with optional reveal/skip (Practice only)
- Map fills countries as they're answered
- Real-time feedback (green flash correct, red flash incorrect)

**State**:
- Game state from Zustand store
- Current question
- Answered countries
- Lives remaining
- Incorrect guess count

**Props**:
- `params.id`: Game ID from URL

---

### ResultsPage

**Path**: `app/results/[id]/page.tsx`

**Purpose**: Display game results

**Layout** (Challenge Success):
```
┌──────────────────────────────────┐
│          RESULTS                 │
├──────────────────────────────────┤
│  ✅ Challenge Complete!          │
│                                  │
│  Region:         Europe          │
│  Questions:      Countries+Flags │
│  Countries:      47 of 47        │
│  Lives:          2 Remaining     │
│  Incorrect:      1 Guess         │
│  Completed:      Jul 10, 2026    │
│                                  │
│  Your Rank:      #5 of 342       │
│                                  │
│  [ View Leaderboard ]            │
│  [ Try Again ]  [ Home ]         │
└──────────────────────────────────┘
```

**Layout** (Challenge Failure):
```
┌──────────────────────────────────┐
│          RESULTS                 │
├──────────────────────────────────┤
│  ❌ Challenge Failed             │
│                                  │
│  Reason:         Lives Lost      │
│  Countries:      32 of 47        │
│  Lives:          0 Remaining     │
│  Incorrect:      3 Guesses       │
│                                  │
│  [ Retry ]  [ Change Mode ]      │
│  [ Home ]                        │
└──────────────────────────────────┘
```

**Features**:
- Success/failure indicator
- Results display (lives, incorrect guesses, region, modes)
- Countries completed count
- Leaderboard rank (successful only)
- Action buttons for retry/home
- Sharing button (optional)

**State**:
- Game results from API
- User's leaderboard position

**Props**:
- `params.id`: Result/game ID from URL

---

### LeaderboardPage

**Path**: `app/leaderboard/[region]/[combo]/page.tsx`

**Purpose**: Display rankings for specific region + combo + month

**Layout**:
```
┌──────────────────────────────────┐
│   Leaderboard                    │
├──────────────────────────────────┤
│   Europe / Countries             │
│   [ July 2026 ] [▼]              │
│   Total Players: 421             │
│                                  │
│   Rank | Player    | Time    | L |
│   ────────────────────────────── │
│   1    | geoguru   | 2:34.5  | 3 |
│   2    | mapmaster | 2:35.2  | 3 |
│   3    | explorer  | 2:41.3  | 2 |
│   ...                           │
│   8 ⭐ | You       | 2:45.3  | 2 |
│                                  │
│   [ Load More ]                  │
│   [ Back ]                       │
└──────────────────────────────────┘
```

**Features**:
- Leaderboard table with pagination
- Month/year selector dropdown
- User's rank highlighted
- Scroll to user's position
- Back button to region page

**State**:
- Selected month/year
- Leaderboard entries (paginated)
- User's position in leaderboard
- Total players

**Props**:
- `params.region`: Region name
- `params.combo`: Question type combo (url-encoded)

---

## Shared Components

### Header

**Purpose**: Navigation bar across all pages

**Layout**:
```
┌──────────────────────────────┐
│ 🗺 COUNTRIES | [ User Menu ] │
└──────────────────────────────┘
```

**Features**:
- Logo/title
- User profile menu (login/logout)
- Current page indicator

**Props**:
- `title` (string): Current page title

---

### StatusBar

**Purpose**: Display game status during gameplay

**Features**:
- Lives display (hearts or number)
- Incorrect guess counter
- Countries completed progress
- Pause/quit button

**Props**:
- `livesRemaining` (number)
- `incorrectGuesses` (number)
- `answeredCount` (number)
- `totalCount` (number)
- `onQuit` (function)

---

### GameMap

**Purpose**: Interactive SVG map with selectable countries

**Features**:
- Renders SVG paths for each country
- Highlights on hover
- Fills on correct answer
- Zooming/panning (optional)
- Touch support

**Props**:
- `region` (string)
- `countries` (Country[])
- `answeredCountries` (Set<string>)
- `onCountryClick` (function)
- `disabled` (boolean)

---

### Country (SVG Path)

**Purpose**: Individual country clickable element

**Features**:
- Outline default
- Highlight on hover
- Fill when answered
- Click handler
- Accessible

**Props**:
- `id` (string)
- `svgPath` (string)
- `name` (string)
- `answered` (boolean)
- `onClick` (function)
- `disabled` (boolean)

---

### QuestionPrompt

**Purpose**: Display current question

**Layout**:
```
┌────────────────────────────────┐
│  Find Germany                  │
│                                │
│ (Practice: [ Reveal ] [ Skip ]) │
└────────────────────────────────┘
```

**Features**:
- Question text ("Find [Country/City/Flag]")
- Flag image (if flag type)
- Reveal/Skip buttons (practice only)
- Flash animation on feedback

**Props**:
- `question` (Question)
- `mode` (string)
- `onReveal` (function)
- `onSkip` (function)

---

### FlagImage

**Purpose**: Display country flag

**Features**:
- Flag image
- Responsive sizing
- Fallback (country code)

**Props**:
- `countryId` (string)
- `size` (string): small, medium, large
- `alt` (string)

---

### LeaderboardTable

**Purpose**: Render leaderboard entries

**Features**:
- Sortable columns
- Pagination controls
- User highlighting
- Responsive

**Props**:
- `entries` (LeaderboardEntry[])
- `userRank` (number)
- `totalPlayers` (number)
- `onLoadMore` (function)

---

### MonthSelector

**Purpose**: Select leaderboard month/year

**Features**:
- Month/year dropdown
- Previous/next buttons
- Show current month indicator

**Props**:
- `currentMonth` (number)
- `currentYear` (number)
- `onChange` (function)

---

### QuestionTypeSelector

**Purpose**: Modal dialog for selecting question types

**Layout**:
```
┌─────────────────────────────┐
│ Select Question Types       │
├─────────────────────────────┤
│ ☐ Countries                 │
│ ☐ Capital Cities            │
│ ☐ Flags                     │
│                             │
│ [ Start Game ]  [ Cancel ]  │
└─────────────────────────────┘
```

**Features**:
- Checkboxes for each type
- At least one required
- Start button disabled if none selected
- Close button

**Props**:
- `onStart` (function)
- `onCancel` (function)

---

## Shared UI Components

### Button

Standard button component with variants.

**Props**:
- `children` (ReactNode)
- `onClick` (function)
- `disabled` (boolean)
- `variant` ('primary' | 'secondary' | 'danger')
- `size` ('sm' | 'md' | 'lg')

---

### Card

Container with styled background and padding.

**Props**:
- `children` (ReactNode)
- `className` (string)

---

### Modal

Dialog overlay component.

**Props**:
- `isOpen` (boolean)
- `onClose` (function)
- `children` (ReactNode)
- `title` (string)

---

### Loading

Spinner/loading indicator.

**Props**:
- `message` (string)

---

### Toast

Notification message.

**Props**:
- `message` (string)
- `type` ('success' | 'error' | 'info')
- `duration` (number): milliseconds

---

## Component Summary Table

| Component | Type | Purpose | State | Props |
|-----------|------|---------|-------|-------|
| HomePage | Page | Region selection | None | None |
| RegionPage | Page | Region dashboard | Stats | region |
| GamePage | Page | Active gameplay | Game | gameId |
| ResultsPage | Page | Result display | Results | resultId |
| LeaderboardPage | Page | Rankings | Leaderboard | region, combo |
| Header | Shared | Navigation | None | title |
| StatusBar | Game | Game status | Live | lives, time, counts |
| GameMap | Game | Map interaction | Rendering | region, countries |
| Country | Game | Country element | Answered | id, path, name |
| QuestionPrompt | Game | Question display | Current | question, mode |
| FlagImage | Game | Flag display | Loaded | countryId, size |
| LeaderboardTable | Leaderboard | Rankings display | Paginated | entries, userRank |
| MonthSelector | Leaderboard | Month selection | Selected | month, year |
| QuestionTypeSelector | Modal | Type selection | Checked | none |

---

## Component Version

**Version**: 2.0 (Simplified)
**Date**: 2026-07-10
**Status**: Ready for Implementation
