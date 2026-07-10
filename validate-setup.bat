@echo off
REM MapMaster Setup Validator for Windows
REM Run this to check if everything is ready to run

echo.
echo ========================================
echo   MapMaster Setup Validation (Windows)
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Download from nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] npm not found
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm: %NPM_VERSION%

REM Check package.json
if exist "package.json" (
    echo [OK] package.json exists
) else (
    echo [X] package.json not found
    pause
    exit /b 1
)

REM Check critical files
echo.
echo Checking critical files...
echo.

setlocal enabledelayedexpansion
set missing=0

for %%f in (
    "src\app\page.tsx"
    "src\app\game\page.tsx"
    "src\app\results\page.tsx"
    "src\store\gameStore.ts"
    "src\components\GameMap.tsx"
    "src\lib\audio.ts"
    "src\lib\map-utils.ts"
    "src\components\ErrorBoundary.tsx"
    "src\components\Skeleton.tsx"
    "next.config.js"
    "tsconfig.json"
) do (
    if exist "%%f" (
        echo [OK] %%f
    ) else (
        echo [X] MISSING: %%f
        set /a missing=!missing!+1
    )
)

echo.
if %missing% gtr 0 (
    echo [X] %missing% files missing!
    pause
    exit /b 1
)

echo [OK] All critical files present!

REM Check node_modules
echo.
if exist "node_modules" (
    echo [OK] node_modules exists
    if exist "node_modules\howler" (
        echo     [OK] howler.js installed
    ) else (
        echo     [!] howler.js not installed (optional)
    )
) else (
    echo [!] node_modules not found
    echo     Run: npm install
)

REM Check .env.local
echo.
if exist ".env.local" (
    echo [OK] .env.local exists
) else (
    echo [!] .env.local not found
    echo     Run: copy .env.example .env.local
)

REM Summary
echo.
echo ========================================
echo   Setup Validation Complete!
echo ========================================
echo.
echo Ready to run:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
