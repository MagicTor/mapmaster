# MapMaster - Deployment Guide

## 1. Deployment Overview

**Architecture**:
- Frontend: Vercel (Edge network, auto-scaling)
- Backend: Railway or AWS (Docker containers)
- Database: Railway PostgreSQL or AWS RDS
- CDN: Vercel (built-in)
- Monitoring: Sentry + PostHog

**Deployment Flow**:
```
Git Push → GitHub Actions → Tests → Build → Deploy → Monitor
```

---

## 2. Development Environment Setup

### 2.1 Prerequisites
- Node.js 20+ and npm 10+
- PostgreSQL 14+
- Git
- GitHub account
- Vercel account
- Railway account (or AWS)

### 2.2 Local Development Setup

**1. Clone Repository**
```bash
git clone https://github.com/yourusername/mapmaster.git
cd mapmaster
```

**2. Install Dependencies**
```bash
npm install
```

**3. Environment Variables**
Create `.env.local`:
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mapmaster_dev"

# Authentication
AUTH_JWT_SECRET=replace-with-a-long-random-secret

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
API_INTERNAL_URL=http://localhost:3000

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

**4. Setup Database**
```bash
# Create database
createdb mapmaster_dev

# Generate Prisma client
npm run prisma:generate

# Sync schema to database (this repo currently has no committed migrations folder)
npm run db:push

# Seed data
npm run db:seed
```

**5. Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

---

## 3. Production Environment

### 3.1 Environment Variables

Create `.env.production` (never commit):
```
# Database (use connection pooling in production)
DATABASE_URL="postgresql://user:password@host:5432/mapmaster?sslmode=require&schema=public&pgbouncer=true"

# Authentication
AUTH_JWT_SECRET=replace-with-a-long-random-secret

# Redis
REDIS_URL="redis://:password@host:6379"

# API URLs
NEXT_PUBLIC_API_URL=https://mapmaster.com
API_INTERNAL_URL=https://api.mapmaster.com (or Vercel internal)

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sn_release_xxx

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_live_xxx

# Security
NEXT_PUBLIC_ENVIRONMENT=production
SESSION_SECRET=long-random-string-min-32-chars
ENCRYPTION_KEY=another-long-random-string

# Feature Flags
NEXT_PUBLIC_ENABLE_MULTIPLAYER=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 3.2 Vercel Deployment

**1. Connect Repository**
```bash
npm install -g vercel
vercel link
```

**2. Configure Environment Variables**
```bash
# In Vercel Dashboard or via CLI
vercel env add DATABASE_URL
vercel env add AUTH_JWT_SECRET
# ... add all other variables
```

**3. Configure Build Settings**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**4. Create vercel.json**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database_url",
    "AUTH_JWT_SECRET": "@auth_jwt_secret"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=60, must-revalidate"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

**5. Deploy**
```bash
vercel deploy --prod
```

### 3.3 Railway Deployment (Backend)

**1. Create Railway Project**
```bash
railway init
```

**2. Add Plugins**
- PostgreSQL
- Redis (optional)
- Node.js environment

**3. Configure Variables**
```bash
railway variable add DATABASE_URL
railway variable add AUTH_JWT_SECRET
# ... add all variables
```

**4. Deploy**
```bash
railway deploy
```

---

## 4. Database Deployment

### 4.1 PostgreSQL on Railway

**1. Create PostgreSQL Database**
- Create in Railway dashboard
- Auto-generates DATABASE_URL

**2. Create Database**
```bash
# Connect and create
psql $DATABASE_URL -c "CREATE DATABASE mapmaster_prod;"
```

**3. Sync Schema**
```bash
DATABASE_URL=$PROD_DATABASE_URL npx prisma db push
```

**4. Seed Data**
```bash
DATABASE_URL=$PROD_DATABASE_URL npx prisma db seed --skip-generate
```

### 4.2 PostgreSQL on AWS RDS

**1. Create RDS Instance**
- Engine: PostgreSQL 14+
- Instance: db.t3.small (for MVP)
- Storage: 50GB
- Backup: 7 days
- Multi-AZ: Yes (for production)

**2. Create Database**
```bash
psql -h <endpoint> -U admin -c "CREATE DATABASE mapmaster_prod;"
```

**3. Sync Schema**
```bash
DATABASE_URL="postgresql://admin:password@endpoint:5432/mapmaster_prod" npx prisma db push
```

### 4.3 Connection Pooling

**PgBouncer Configuration**
```ini
[databases]
mapmaster_prod = host=db.example.com port=5432 dbname=mapmaster_prod

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
```

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Setup database
        run: npx prisma db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mapmaster_test
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build

  deploy-vercel:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-railway:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railwayapp/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}

  notify:
    needs: [deploy-vercel, deploy-railway]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 5.2 Pre-deployment Checklist

- [ ] All tests passing
- [ ] No type errors
- [ ] Linting passes
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Database migrations tested locally
- [ ] Environment variables configured
- [ ] Sentry release created
- [ ] Monitoring alerts set up

---

## 6. Monitoring & Health Checks

### 6.1 Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
export async function GET(req: Request) {
  const checks = {
    api: 'ok',
    database: 'ok',
    redis: 'ok',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    checks.database = 'error';
  }
  
  try {
    // Check Redis
    await redis.ping();
  } catch (error) {
    checks.redis = 'error';
  }
  
  const allHealthy = Object.values(checks).every(v => v === 'ok');
  
  return Response.json(checks, {
    status: allHealthy ? 200 : 503
  });
}
```

### 6.2 Monitoring Services

**Sentry Configuration**:
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event, hint) {
    if (event.exception) {
      const error = hint.originalException;
      // Filter out known non-critical errors
      if (error?.message?.includes('ResizeObserver')) {
        return null;
      }
    }
    return event;
  }
});
```

**PostHog Analytics**:
```typescript
// Initialize in _app.tsx
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug()
    }
  })
}
```

### 6.3 Alerts

**Sentry Alerts**:
- Alert on error rate > 5%
- Alert on performance degradation
- Alert on new issues

**Custom Monitors** (Pingdom/UptimeRobot):
```
GET https://mapmaster.com/api/health
Interval: 5 minutes
Alert: If > 3 consecutive failures
```

---

## 7. Performance Optimization

### 7.1 Image Optimization

**next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'flags.example.com' },
      { hostname: 'avatars.example.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  swcMinify: true,
  reactStrictMode: true,
  compress: true
}
```

### 7.2 Bundle Analysis

```bash
npm run analyze
```

Create `next.config.js` with bundle analyzer:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

### 7.3 Content Delivery

- Static assets: Vercel CDN (automatic)
- API responses: Redis cache layer
- Database queries: Connection pooling + indexing

---

## 8. Rollback Procedures

### 8.1 Vercel Rollback

```bash
# View deployments
vercel deployments list

# Rollback to previous
vercel rollback

# Or redeploy specific commit
vercel deploy --prod --skip-build
```

### 8.2 Database Rollback

```bash
# Check migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back {migration_name}

# Or reset (dev only!)
npx prisma migrate reset --skip-generate
```

### 8.3 Data Recovery

```bash
# From PostgreSQL backup
pg_restore --clean --if-exists -d mapmaster_prod backup.dump
```

---

## 9. Maintenance & Updates

### 9.1 Database Maintenance

**Weekly**:
```sql
ANALYZE;
REINDEX INDEX CONCURRENTLY idx_name;
```

**Monthly**:
```sql
VACUUM FULL ANALYZE;
```

### 9.2 Dependency Updates

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update major versions
npm upgrade

# Review and test
npm test
```

### 9.3 Security Updates

```bash
# Audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 10. Disaster Recovery Plan

### 10.1 Recovery Time Objectives (RTO)

| Scenario | RTO | Action |
|----------|-----|--------|
| Vercel down | 5 min | Redirect to backup CDN |
| Database corruption | 1 hour | Restore from hourly backup |
| Complete outage | 2 hours | Migrate to standby region |

### 10.2 Backup Strategy

- **Database**: Automated daily + continuous archival
- **User Data**: Weekly encrypted backup to S3
- **Configs**: Version controlled in GitHub
- **Secrets**: Stored in Vercel/Railway dashboards

### 10.3 Disaster Scenarios

**Database Down**:
1. Switch to read replica (multi-AZ setup)
2. If both down, restore from backup
3. Alert ops team on Slack

**Vercel Down**:
1. Traffic automatically routed to next fastest edge
2. If complete: redeploy to backup CDN
3. DNS failover (5 min)

**Redis Down**:
1. App works without cache (performance degraded)
2. Restart Redis service
3. Rebuild cache from database

---

## 11. Security in Deployment

### 11.1 Environment Secrets

**Vercel**:
1. Never commit `.env.production.local`
2. Use Vercel dashboard for secrets
3. Rotate secrets every 90 days
4. Use separate tokens for staging/prod

**GitHub**:
1. Configure branch protection
2. Require PR reviews before merge
3. Require status checks passing
4. Use GitHub Secrets for tokens

### 11.2 SSL/TLS

- Vercel provides automatic SSL
- Auto-renewal via Let's Encrypt
- HSTS headers configured
- Redirect HTTP → HTTPS

### 11.3 Rate Limiting

Implemented at API level (see API spec document).

---

## 12. Cost Optimization

### 12.1 Vercel Pricing

- Pro: $20/month (recommended for MVP)
- Serverless Functions: $0.50 per 1M invocations
- Data Transfer: $0.50 per GB after 100GB free

### 12.2 Railway Pricing

- Pay per use
- Estimated MVP: $10-30/month
- Includes: PostgreSQL, Redis, Node.js

### 12.3 Optimization Tips

- Cache API responses (reduce database queries)
- Use CDN for static assets
- Optimize images
- Archive old game data to cold storage
- Use reserved capacity for predictable load

---

## 13. Post-Launch Monitoring

### 13.1 Daily Checks
- Error rate < 0.1%
- API latency < 200ms
- Database health
- Leaderboard calculations running

### 13.2 Weekly Checks
- User feedback/support tickets
- Performance metrics
- Error patterns
- Database growth rate

### 13.3 Monthly Reviews
- Cost analysis
- Feature usage metrics
- Retention metrics
- Planned maintenance

---

## 14. Support & Escalation

**On-Call Rotation**:
- 24/7 on-call engineer (future phase)
- Slack alerts for critical issues
- PagerDuty for incident management

**Escalation Path**:
1. Automated alert triggered
2. On-call engineer notified
3. 30 min: investigate and diagnose
4. 1 hour: implement fix or rollback
5. Post-mortem within 24 hours

---

## Deployment Guide Info
- **Version**: 1.0
- **Last Updated**: 2026-07-10
- **Owner**: DevOps Team
- **Next Review**: 2026-09-10
