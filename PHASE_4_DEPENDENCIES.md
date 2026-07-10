# Phase 4: Dependencies & Installation Guide

## Dependencies to Install

Run this command in your project root:

```bash
npm install howler.js geojson-utils
npm install --save-dev @types/howler.js
```

## Why These Libraries

| Library | Size | Purpose | Why |
|---------|------|---------|-----|
| `howler.js` | ~15KB | Audio effects | Cross-browser audio, easy API, no Flash |
| `geojson-utils` | ~5KB | GeoJSON helpers | Click-point-in-polygon detection |
| `react-simple-maps` | ~50KB | SVG maps (already installed) | Industry standard, proven, active |

## Already Installed

- ✅ react-simple-maps (3.0.1)
- ✅ framer-motion (animations)
- ✅ zustand (state)
- ✅ tailwindcss (styling)
- ✅ zod (validation)
- ✅ react-hot-toast (notifications)
- ✅ react-icons (UI icons)
- ✅ date-fns (date utilities)

## Optional (for later)

These are already in package.json for future phases:
- `@next/bundle-analyzer` - Performance analysis
- `jest` + `@testing-library/react` - Unit testing
- `@playwright/test` - E2E testing

## Installation Steps

1. **Install new dependencies**:
   ```bash
   npm install howler.js geojson-utils
   npm install --save-dev @types/howler.js
   ```

2. **Verify installation**:
   ```bash
   npm list howler.js geojson-utils react-simple-maps
   ```

3. **TypeScript types**:
   ```bash
   # If types not installed automatically
   npm install --save-dev @types/geojson-utils
   ```

4. **Update imports** (all Phase 4 files will use these):
   ```typescript
   import { Howl } from 'howler';
   import * as gju from 'geojson-utils';
   import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
   ```

## After Running npm install

Files in this phase are ready to use immediately. No additional setup needed beyond npm install.

## Rollback Plan

If issues occur:
```bash
npm uninstall howler.js geojson-utils
npm install react-simple-maps@3.0.0  # Downgrade if needed
```

---

**Next**: Create all Phase 4 implementation files (they're already written and waiting)
