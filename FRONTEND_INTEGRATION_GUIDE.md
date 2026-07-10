# Frontend Integration Guide

Quick reference for frontend developers implementing MapMaster UI.

---

## Backend Ready ✅

All API endpoints are implemented and documented.
- See `API_DOCUMENTATION.md` for full endpoint reference
- See `DEPLOYMENT_GUIDE.md` for setup instructions

---

## API Quick Reference

### Create Game
```typescript
const response = await fetch('/api/games/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    region: 'Europe',
    questionTypes: ['countries'],
    mode: 'challenge' // or 'practice'
  })
});

// Response includes: gameId, countries[], totalCountries, questionTypes, mode
```

### Submit Answer
```typescript
const response = await fetch(`/api/games/${gameId}/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    countryId: 'DE', // ISO 3166-1 alpha-2 code
    questionType: 'countries' // or 'capitals', 'flags'
  })
});

// Response: { correct: boolean, nextQuestion?: {...} }
```

### Complete Game (Challenge Only)
```typescript
const response = await fetch(`/api/games/${gameId}/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    successful: true, // false if game lost (0 lives)
    livesRemaining: 2,
    incorrectGuesses: 3,
    completedAt: new Date().toISOString()
  })
});

// Response: { leaderboardRank, totalQualifiedPlayers, score, ... }
```

### Get Leaderboard
```typescript
const response = await fetch(
  `/api/leaderboards/Europe/countries?month=7&year=2024`
);

// Response: { entries: [{ rank, username, livesRemaining, incorrectGuesses, ... }] }
```

### Get User Stats
```typescript
const response = await fetch(
  `/api/stats/user/${userId}?region=Europe&combo=countries`
);

// Response: { stats: { totalCompletions, monthlyCompletions, bestResult, ... } }
```

---

## Data Available from Backend

### Regions (7)
```typescript
const REGIONS = [
  'North America',   // 24 countries
  'South America',   // 13 countries
  'Asia',            // 47 countries
  'Europe',          // 47 countries
  'Oceania',         // 17 countries
  'Africa',          // 55 countries
  'World'            // 203 countries (all)
];
```

### Question Types (7 combos)
```typescript
const QUESTION_COMBOS = [
  'countries',
  'capitals',
  'flags',
  'countries-capitals',
  'countries-flags',
  'capitals-flags',
  'capitals-countries-flags'
];
```

### Question Formats
```typescript
// Countries mode
'Find Germany'

// Capitals mode
'Find Berlin'

// Flags mode
'Find [Flag Image]'
```

---

## State Management (Zustand)

Create these stores:

```typescript
// src/store/gameStore.ts
interface GameStore {
  gameId: string;
  region: string;
  questionTypes: string[];
  mode: 'practice' | 'challenge';
  countries: CountryData[];
  currentQuestion: Question;
  answeredCountries: Set<string>;
  lives: number;
  incorrectGuesses: number;
  startTime: Date;
  
  setGame: (game: GameData) => void;
  submitAnswer: (countryId: string) => Promise<void>;
  completeGame: () => Promise<GameResult>;
  skip: () => void;
  reveal: () => void;
}

// src/store/uiStore.ts
interface UIStore {
  currentPage: 'home' | 'region' | 'game' | 'results' | 'leaderboard';
  selectedRegion: string | null;
  selectedQuestionTypes: string[];
  selectedMonth: number;
  selectedYear: number;
  
  setPage: (page: string) => void;
  setRegion: (region: string) => void;
  setQuestionTypes: (types: string[]) => void;
}

// src/store/userStore.ts
interface UserStore {
  userId: string | null;
  username: string | null;
  displayName: string | null;
  isAuthenticated: boolean;
  
  setUser: (user: UserData) => void;
  logout: () => void;
}
```

---

## Page Flow

### 1. HomePage
- Display 7 region selection buttons
- User clicks region → Navigate to RegionPage

```typescript
// src/app/page.tsx or src/app/home/page.tsx
const regions = [
  'North America', 'South America', 'Asia', 'Europe',
  'Oceania', 'Africa', 'World'
];

return (
  <div>
    <h1>COUNTRIES OF THE WORLD</h1>
    <div className="grid grid-cols-2 gap-4">
      {regions.map(r => (
        <button onClick={() => router.push(`/region/${r}`)}>
          {r}
        </button>
      ))}
    </div>
  </div>
);
```

### 2. RegionPage
- Display 3 buttons: Practice, Challenge, Leaderboard
- Display monthly stats for each question type combo (7 stats blocks)
- User selects button → Opens checkbox modal or leaderboard

```typescript
// src/app/region/[region]/page.tsx
const regions = [
  'North America', 'South America', 'Asia', 'Europe',
  'Oceania', 'Africa', 'World'
];
const combos = [
  'countries', 'capitals', 'flags',
  'countries-capitals', 'countries-flags', 'capitals-flags',
  'capitals-countries-flags'
];

return (
  <div>
    <h1>{region}</h1>
    
    <div className="buttons">
      <button onClick={handlePractice}>Practice</button>
      <button onClick={handleChallenge}>Challenge</button>
      <button onClick={handleLeaderboard}>Leaderboard</button>
    </div>
    
    <div className="stats-grid">
      {combos.map(combo => (
        <div key={combo} className="stat-card">
          {/* Display monthly stats for this combo */}
          {stats[combo]?.lastCompletion && (
            <>
              <h3>{comboLabel(combo)}</h3>
              <p>Last: {stats[combo].lastCompletion.time}</p>
              <p>Best: {stats[combo].bestResult.time}</p>
              <p>Rank: {stats[combo].currentRank}</p>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);
```

### 3. Question Type Selector Modal
- Show 3 checkboxes (Countries, Capitals, Flags)
- At least 1 must be checked
- Display as modal after Practice/Challenge click

```typescript
// src/components/QuestionTypeSelector.tsx
const [selected, setSelected] = useState<string[]>([]);

return (
  <div className="modal">
    <h2>Select Question Types</h2>
    <label>
      <input
        type="checkbox"
        checked={selected.includes('countries')}
        onChange={() => toggle('countries')}
      />
      Countries
    </label>
    <label>
      <input
        type="checkbox"
        checked={selected.includes('capitals')}
        onChange={() => toggle('capitals')}
      />
      Capital Cities
    </label>
    <label>
      <input
        type="checkbox"
        checked={selected.includes('flags')}
        onChange={() => toggle('flags')}
      />
      Flags
    </label>
    
    <button onClick={() => startGame()} disabled={selected.length === 0}>
      Start Game
    </button>
  </div>
);
```

### 4. GamePage
- Display interactive map (SVG or Canvas)
- Display current question at top
- Display status bar (Lives, Incorrect Guesses, Progress)
- Buttons for Reveal/Skip (Practice only)

```typescript
// src/app/game/[id]/page.tsx
return (
  <div className="game-container">
    <StatusBar
      lives={gameStore.lives}
      incorrectGuesses={gameStore.incorrectGuesses}
      progress={gameStore.answeredCountries.size / gameStore.countries.length}
    />
    
    <QuestionPrompt question={gameStore.currentQuestion} />
    
    <GameMap
      countries={gameStore.countries}
      answered={gameStore.answeredCountries}
      onCountryClick={handleCountryClick}
    />
    
    {mode === 'practice' && (
      <div className="buttons">
        <button onClick={() => gameStore.reveal()}>Reveal</button>
        <button onClick={() => gameStore.skip()}>Skip</button>
      </div>
    )}
  </div>
);
```

### 5. ResultsPage
- Display game results (Lives, Incorrect Guesses, Region, Question Types)
- For Challenge: Show leaderboard rank and global stats
- Show button to return to region or home

```typescript
// src/app/results/page.tsx
return (
  <div>
    <h1>{challenge ? 'Challenge Complete!' : 'Practice Complete!'}</h1>
    
    <div className="results">
      <p>Region: {result.region}</p>
      <p>Lives Remaining: {result.livesRemaining}</p>
      <p>Incorrect Guesses: {result.incorrectGuesses}</p>
      {challenge && (
        <>
          <p>Your Rank: #{result.leaderboardRank} of {result.totalPlayers}</p>
          <p>Score: {result.score}</p>
        </>
      )}
    </div>
    
    <button onClick={() => router.push(`/region/${result.region}`)}>
      Back to Region
    </button>
  </div>
);
```

### 6. LeaderboardPage
- Display 7 tabs (one for each combo) or dropdown selector
- Show month/year selector
- Show top 100 rankings
- Highlight current user's position

```typescript
// src/app/leaderboard/[region]/page.tsx
return (
  <div>
    <h1>{region} Leaderboards</h1>
    
    <MonthSelector month={month} year={year} onChange={handleMonthChange} />
    
    <Tabs>
      {combos.map(combo => (
        <Tab key={combo} label={comboLabel(combo)}>
          <LeaderboardTable
            entries={leaderboards[combo]}
            currentUserRank={userRanks[combo]}
          />
        </Tab>
      ))}
    </Tabs>
  </div>
);
```

---

## Component Checklist

### Pages (src/app/)
- [ ] HomePage - 7 region buttons
- [ ] RegionPage - Practice/Challenge/Leaderboard + stats
- [ ] GamePage - Map + question + status bar
- [ ] ResultsPage - Results + leaderboard position
- [ ] LeaderboardPage - Rankings with month selector

### Components (src/components/)
- [ ] GameMap - Interactive SVG map
- [ ] QuestionPrompt - Display question
- [ ] StatusBar - Lives + incorrect + progress
- [ ] LeaderboardTable - Ranked results
- [ ] MonthSelector - Month/year picker
- [ ] QuestionTypeSelector - Checkbox modal
- [ ] CountryHoverCard (optional) - Info on hover
- [ ] LoadingSpinner - Loading states
- [ ] ErrorMessage - Error handling
- [ ] Toast - Notifications

### Shared
- [ ] Button - Reusable button
- [ ] Card - Reusable card
- [ ] Modal - Modal wrapper
- [ ] Header - Navigation
- [ ] Footer - Footer info

---

## Game Logic Implementation

### Answer Validation
```typescript
async function handleCountryClick(countryId: string) {
  const question = gameStore.currentQuestion;
  let isCorrect = false;

  // Check based on question type
  if (question.type === 'countries') {
    isCorrect = countryId === question.targetCountryId;
  } else if (question.type === 'capitals') {
    // Get country by capital name
    const country = countries.find(c => c.capital === question.targetCapital);
    isCorrect = countryId === country?.id;
  } else if (question.type === 'flags') {
    isCorrect = countryId === question.targetCountryId;
  }

  if (isCorrect) {
    // Correct answer
    gameStore.answeredCountries.add(countryId);
    handleNextQuestion();
  } else {
    // Wrong answer
    gameStore.incorrectGuesses++;
    if (mode === 'challenge') {
      gameStore.lives--;
      if (gameStore.lives === 0) {
        // Game over - user lost
        await gameStore.completeGame();
        router.push('/results');
      }
    }
    showFeedback('incorrect');
  }
}
```

### Question Generation
```typescript
function generateNextQuestion(): Question {
  const answered = gameStore.answeredCountries;
  const unanswered = gameStore.countries.filter(c => !answered.has(c.id));

  if (unanswered.length === 0) {
    // All countries answered
    return null;
  }

  const target = unanswered[Math.floor(Math.random() * unanswered.length)];
  const type = gameStore.questionTypes[
    Math.floor(Math.random() * gameStore.questionTypes.length)
  ];

  if (type === 'countries') {
    return {
      type: 'countries',
      prompt: `Find ${target.name}`,
      targetCountryId: target.id
    };
  } else if (type === 'capitals') {
    return {
      type: 'capitals',
      prompt: `Find ${target.capital}`,
      targetCapital: target.capital,
      targetCountryId: target.id
    };
  } else if (type === 'flags') {
    return {
      type: 'flags',
      prompt: 'Find',
      flagUrl: target.flagUrl,
      targetCountryId: target.id
    };
  }
}
```

---

## Color & Styling Guide

### Country States on Map
- **Default**: Outline only, light gray
- **Hovered**: Light blue fill, darker border
- **Answered/Correct**: Green fill (#10b981)
- **Incorrect**: Flash red briefly (#ef4444), then back to default
- **All Answered**: Green fill

### UI Colors
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Yellow (#f59e0b)
- Background: White or Dark Gray
- Text: Dark Gray or White

### Animations
- Country fill-in: 0.3s ease-in-out
- Question change: 0.2s fade
- Flash feedback: 0.4s
- Button hover: 0.15s

---

## Testing Checklist

- [ ] Game creation with all 7 regions
- [ ] Game creation with all 7 question combos
- [ ] Practice mode: Reveal button works
- [ ] Practice mode: Skip button works
- [ ] Practice mode: Results never saved
- [ ] Challenge mode: Lives decrease on wrong answer
- [ ] Challenge mode: Game ends when lives = 0
- [ ] Challenge mode: Results saved to leaderboard
- [ ] Leaderboard: Rankings sorted by lives DESC
- [ ] Leaderboard: Secondary sort by incorrect guesses ASC
- [ ] Leaderboard: Monthly filtering works
- [ ] Mobile responsive: Touch works
- [ ] Keyboard navigation: Tab through map works
- [ ] Dark mode: All colors visible and readable

---

## Common Challenges & Solutions

### Interactive Map
**Challenge**: Make SVG clickable with proper hit detection
**Solution**: 
- Use react-simple-maps with GeoJSON data
- Or: Use Canvas with click coordinate mapping
- Ensure small countries are clickable (zoom on hover)

### Real-time Feedback
**Challenge**: Show correct/incorrect feedback without lag
**Solution**:
- Cache country data in Zustand
- Validate answers client-side (avoid API round-trip)
- Only API call on game completion

### Leaderboard Updates
**Challenge**: Show user's rank immediately after completion
**Solution**:
- Calculate rank client-side based on API response
- Make API call to confirm rank after game save
- Cache monthly leaderboards in localStorage

---

## Next Steps

1. **Setup Phase**: Install dependencies, configure database
2. **Create Zustand stores** for game, UI, and user state
3. **Build HomePage and RegionPage** (simple UI first)
4. **Implement GamePage** with map component
5. **Build LeaderboardPage** with results display
6. **Add styling and animations** (Tailwind + Framer Motion)
7. **Test all game flows** thoroughly
8. **Optimize performance** and mobile experience
9. **Add accessibility features**
10. **Deploy to Vercel**

Backend is ready. Good luck with frontend implementation! 🚀
