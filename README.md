# MapMaster - Browser-Based World Geography Game

A modern, production-ready web application for testing and improving geography knowledge through interactive map challenges.

## 🌍 Features

- **Interactive World Map**: Click countries to answer geography questions
- **Multiple Game Modes**: Practice, Timed, and Challenge modes
- **Various Question Types**: Country names, capital cities, flags
- **Difficulty Levels**: Easy, Medium, Hard, and Expert
- **Comprehensive Scoring System**: Points, streaks, bonuses, and multipliers
- **Achievement System**: 60+ achievements to unlock
- **Detailed Statistics**: Track performance by region, country, and mode
- **Global Leaderboards**: Daily, weekly, monthly, and all-time rankings
- **Player Progression**: XP system with 100 levels and 6 ranks
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 14+
- Git

### Installation

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

# Run Prisma migrations
npx prisma migrate dev

# Seed data (optional)
npx prisma db seed
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
│   │   ├── profile/       # User profile page
│   │   ├── stats/         # Statistics page
│   │   ├── achievements/  # Achievements page
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
- **Clerk**: Managed authentication provider

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

### Scoring System

Base score for each correct answer: **100 points**

**Speed Bonus**:
- 0-5 seconds: +50 points
- 5-10 seconds: +25 points
- 10+ seconds: +0 points

**Streak Bonus**:
- Every 5 consecutive correct: +25 points
- Every 10 consecutive correct: +50 points

**Difficulty Multiplier**:
- Easy: 1x
- Medium: 1.5x
- Hard: 2x
- Expert: 2.5x

Formula: `Score = (BaseScore + TimeBonus + StreakBonus) * DifficultyMultiplier`

### Experience & Progression

- **Base XP**: 10 per question
- **Multiplier**: 1.5x for correct, 1x for incorrect
- **XP per Level**: 1000 XP

**Ranks**:
1. Beginner (Levels 1-10)
2. Explorer (Levels 11-25)
3. Cartographer (Levels 26-40)
4. Geographer (Levels 41-60)
5. Atlas Master (Levels 61-85)
6. World Expert (Levels 86-100)

### Achievements

60+ achievements across categories:
- **Milestone**: Game completion milestones
- **Accuracy**: Precision-based achievements
- **Speed**: Time-based achievements
- **Regional**: Region-specific mastery
- **Challenge**: Mode-specific challenges
- **Streak**: Consecutive answer streaks
- **Prestige**: Long-term commitments

## 🔐 Security

- **Authentication**: Clerk managed authentication
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
- **Custom Events**: Game completions, achievements, etc.

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
