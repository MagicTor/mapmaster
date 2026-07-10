#!/bin/bash
# MapMaster Setup Validator
# Run this to check if everything is ready to run

echo "🔍 MapMaster Setup Validation"
echo "=============================="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found. Please install from nodejs.org"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check package.json
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json not found"
    exit 1
fi

# Check critical files
echo ""
echo "Checking critical files..."

files=(
    "src/app/page.tsx"
    "src/app/game/page.tsx"
    "src/app/results/page.tsx"
    "src/store/gameStore.ts"
    "src/components/GameMap.tsx"
    "src/lib/audio.ts"
    "src/lib/map-utils.ts"
    "src/components/ErrorBoundary.tsx"
    "src/components/Skeleton.tsx"
    "next.config.js"
    "tsconfig.json"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
        missing=$((missing + 1))
    fi
done

echo ""
if [ $missing -gt 0 ]; then
    echo "❌ $missing files missing!"
    exit 1
fi

echo "✅ All critical files present!"

# Check node_modules
echo ""
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "   (Dependencies already installed)"
    
    # Check for Howler.js
    if [ -d "node_modules/howler" ]; then
        echo "   ✅ howler.js installed"
    else
        echo "   ⚠️  howler.js not installed (optional)"
    fi
else
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
fi

# Check .env.local
echo ""
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "⚠️  .env.local not found"
    echo "   Run: cp .env.example .env.local"
fi

# Check database setup
echo ""
echo "Database Setup:"
if grep -q "DATABASE_URL" .env.local 2>/dev/null || grep -q "DATABASE_URL" .env.example 2>/dev/null; then
    echo "✅ Database configured"
else
    echo "⚠️  Database URL not configured"
fi

echo ""
echo "=============================="
echo "✅ Setup validation complete!"
echo ""
echo "Ready to run:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
