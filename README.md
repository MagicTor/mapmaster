# MapMaster - Browser-Based World Geography Game

A competitive, production-ready web application for testing geography knowledge through interactive map challenges. Pure skill-based gameplay with transparent rankings.

## 🌍 Features

- **Interactive SVG World Map**: Click countries to answer geography questions (powered by react-simple-maps)
- **Two Game Modes**: 
  - **Practice Mode**: Learn at your own pace (no timer, unlimited guesses, never saved)
  - **Challenge Mode**: Competitive gameplay (3 lives, unlimited time, ranked globally)
- **Multiple Question Types**: Country names, capital cities, and flags (user-selectable)
- **7 Playable Regions**: North America (24), South America (13), Europe (47), Asia (47), Oceania (17), Africa (55), World (203)
- **Pure Competitive Leaderboards**: Monthly rankings segmented by region + question combination
- **Ranking System**: Based on lives remaining, then fewest incorrect guesses
- **Audio System**: Sound effects for correct/incorrect answers with volume control
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 14+
- Git

### Installation

**Debian quick setup (automated):**
```bash
chmod +x ./setup-debian.sh
./setup-debian.sh
```
The script will prompt for:
- `MAPMASTER_DB_NAME` (default: `mapmaster_dev`)
- `MAPMASTER_DB_USER` (default: `mapmaster`)
- `MAPMASTER_DB_PASSWORD` (required, hidden input)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mapmaster.git
cd mapmaster
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Setup database**
```bash
# Create PostgreSQL database
createdb mapmaster_dev

# Generate Prisma client
npm run prisma:generate

# Sync schema to database (this repo currently has no committed migrations folder)
npm run db:push

# Seed data (optional)
npm run db:seed
```

4. **Run development server**
```bash
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
MapMaster/
├── docs/                    # Comprehensive documentation
│   ├── 01-PRD.md           # Product Requirements Document
│   ├── 02-ARCHITECTURE.md  # System Architecture
│   ├── 03-DATABASE.md      # Database Schema & Design
│   ├── 04-API-SPEC.md      # API Specification
│   ├── 05-COMPONENTS.md    # Component Breakdown
│   └── 06-DEPLOYMENT.md    # Deployment Guide
│
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── game/          # Game pages
│   │   ├── leaderboard/   # Leaderboards page
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   │
│   ├── components/         # React components
│   │   ├── layout/        # Layout components
│   │   ├── game/          # Game components
│   │   ├── setup/         # Setup/selection components
│   │   ├── results/       # Results components
│   │   ├── profile/       # Profile components
│   │   └── shared/        # Shared/common components
│   │
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions & helpers
│   │   ├── api.ts         # API client
│   │   ├── constants.ts   # Constants & configuration
│   │   └── utils.ts       # Helper functions
│   │
│   ├── stores/            # Zustand state management
│   │   ├── gameStore.ts   # Game state
│   │   ├── userStore.ts   # User state
│   │   ├── uiStore.ts     # UI state
│   │   └── settingsStore.ts
│   │
│   ├── services/          # Business logic services
│   │   ├── gameService.ts
│   │   ├── scoreService.ts
│   │   └── statisticsService.ts
│   │
│   ├── types/             # TypeScript type definitions
│   ├── assets/            # Static assets
│   └── styles/            # Global styles
│
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
│
├── public/                # Static files
├── docs/                  # Project documentation
├── package.json           # Dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations
- **Zustand**: State management
- **react-simple-maps**: Vector map component
- **Recharts**: Charts and visualizations

### Backend
- **Node.js 20**: JavaScript runtime
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: TypeScript ORM for database access

### Database
- **PostgreSQL**: Relational database
- **Redis**: Caching (optional)
- **PgBouncer**: Connection pooling

### Authentication
- **Local Auth API**: Username/password with bcrypt hashing + JWT tokens

### Deployment
- **Vercel**: Frontend hosting with edge functions
- **Railway/AWS**: Backend and database hosting

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Playwright**: E2E testing

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

1. **[PRD (Product Requirements)](./docs/01-PRD.md)**
   - Complete feature specifications
   - Game mechanics and rules
   - Scoring system details
   - User progression system

2. **[Architecture Document](./docs/02-ARCHITECTURE.md)**
   - System architecture overview
   - Frontend and backend structure
   - Data flow diagrams
   - API design patterns

3. **[Database Schema](./docs/03-DATABASE.md)**
   - Complete Prisma schema
   - Table relationships
   - Indexes and performance optimization
   - Backup strategy

4. **[API Specification](./docs/04-API-SPEC.md)**
   - All API endpoints with examples
   - Request/response formats
   - Error handling
   - Rate limiting

5. **[Component Breakdown](./docs/05-COMPONENTS.md)**
   - 45+ component specifications
   - Component hierarchy
   - Props and state management
   - Implementation order

6. **[Deployment Guide](./docs/06-DEPLOYMENT.md)**
   - Development setup
   - Production deployment
   - CI/CD pipeline
   - Monitoring and alerts

## 🎮 Game Mechanics

### Practice Mode

- **No Timer**: Unlimited time per question
- **Unlimited Guesses**: Try as many times as needed
- **Special Controls**: 
  - Reveal: Shows the correct country and marks it complete
  - Skip: Moves to next question without filling country
- **Completion**: When all countries in the region are filled
- **Results**: Never saved to leaderboard (practice only)

### Challenge Mode

- **3 Lives System**: Start with 3 lives, lose 1 per incorrect guess
- **Unlimited Time**: No timer—play at your own pace
- **Objective**: Fill in every country before losing all 3 lives
- **Results**: Automatically saved to monthly leaderboards
- **Ranking**: By most lives remaining (3 lives = best), then fewest incorrect guesses

### Question Format

All questions follow a consistent pattern: **"Find [Target]"**

**Country Mode Example**:
```
Find Germany
```

**City Mode Example**:
```
Find Berlin
```
(Player clicks the country containing Berlin)

**Flag Mode Example**:
```
Find [Flag Image]
```
(Player clicks the country matching that flag)

### Mixed Questions

When multiple question types are selected, they appear in random order:

```
Question 1: Find France
Question 2: Find [Italian Flag]
Question 3: Find Madrid
Question 4: Find Japan
etc.
```

### Map Visual Feedback

**Question Answered Correctly**:
- Question bar flashes GREEN briefly
- Country fills in with solid color
- Next question appears

**Question Answered Incorrectly**:
- Question bar flashes RED briefly
- Lose 1 life in Challenge Mode
- Country remains outline-only (no permanent red coloring)
- Same question repeats for reattempt

**Game States**:
- **Unanswered**: Country outline only
- **Correct**: Country filled in with color
- **Incomplete**: Unfilled countries remain outlines

### Leaderboard Rankings

Leaderboards are segmented by:
1. **Region** (7 regions)
2. **Question Combination** (7 possible combinations):
   - Countries only
   - Cities only
   - Flags only
   - Countries + Cities
   - Countries + Flags
   - Cities + Flags
   - Countries + Cities + Flags
3. **Month** (each month has separate rankings)

**Ranking Order**:
1. Most Lives Remaining (higher is better)
2. Fewest Incorrect Guesses (lower is better)
3. Earliest Completion Date (tiebreaker)

Example leaderboard entry:
```
Rank #1
Player: GeographyMaster
Region: Europe
Mode: Countries + Flags
Lives Remaining: 3
Incorrect Guesses: 2
Date: July 10, 2026
```

## 🔐 Security

- **Authentication**: Local username/password + JWT
- **Rate Limiting**: Per-endpoint rate limits
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM
- **XSS Prevention**: React's built-in protection + CSP headers
- **CORS**: Restricted to trusted domains
- **HTTPS**: Enforced on production

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation throughout
- Screen reader support with ARIA labels
- Color-blind friendly palettes (Deuteranopia, Protanopia, Tritanopia)
- High contrast mode support
- Focus management and visible indicators

## 📊 Analytics & Monitoring

- **Error Tracking**: Sentry integration
- **User Analytics**: PostHog
- **Performance Monitoring**: Vercel Analytics
- **Uptime Monitoring**: Pingdom/UptimeRobot
- **Custom Events**: Game starts, completions, and leaderboard submissions

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Build & Deployment

### Development
```bash
npm run dev    # Start development server
```

### Production
```bash
npm run build  # Create production build
npm start      # Run production server
```

### Deploy to Vercel
```bash
vercel deploy --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core game mechanics
- [x] Single-player gameplay
- [x] Statistics tracking
- [x] Achievement system
- [x] Leaderboards

### Phase 2 (Q3 2026)
- [ ] Real-time multiplayer
- [ ] Friend challenges
- [ ] Social features
- [ ] Tournament system

### Phase 3 (Q4 2026)
- [ ] Mobile native apps
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom challenges

### Future Considerations
- AI competitors
- VR support
- Offline mode
- Creator program

## 📞 Contact

- **Project Lead**: [Your Name]
- **Email**: contact@mapmaster.com
- **Twitter**: @MapMasterGame
- **Discord**: [Join Community]

---

**MapMaster** - Test your geography knowledge. Challenge the world. Master the map. 🌍

*Built with ❤️ by the MapMaster team*
