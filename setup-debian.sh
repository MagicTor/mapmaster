#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[setup-debian] $*"
}

require_repo_root() {
  if [ ! -f "package.json" ]; then
    echo "Run this script from the MapMaster repository root (where package.json exists)."
    exit 1
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

apt_install() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    apt-get update
    apt-get install -y "$@"
  else
    sudo apt-get update
    sudo apt-get install -y "$@"
  fi
}

run_as_postgres() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    su - postgres -c "$1"
  else
    sudo -u postgres bash -lc "$1"
  fi
}

escape_sql_literal() {
  printf "%s" "$1" | sed "s/'/''/g"
}

require_repo_root

prompt_with_default() {
  local prompt="$1"
  local default_value="$2"
  local input=""
  read -r -p "$prompt [$default_value]: " input
  if [ -z "$input" ]; then
    printf "%s" "$default_value"
  else
    printf "%s" "$input"
  fi
}

prompt_password() {
  local password=""
  local password_confirm=""
  while true; do
    read -r -s -p "Database password (input hidden): " password
    echo ""
    if [ -z "$password" ]; then
      echo "Password cannot be empty."
      continue
    fi
    read -r -s -p "Confirm password: " password_confirm
    echo ""
    if [ "$password" != "$password_confirm" ]; then
      echo "Passwords do not match. Try again."
      continue
    fi
    printf "%s" "$password"
    return
  done
}

DB_NAME="$(prompt_with_default "Database name" "${MAPMASTER_DB_NAME:-mapmaster_dev}")"
DB_USER="$(prompt_with_default "Database user" "${MAPMASTER_DB_USER:-mapmaster}")"
DB_PASSWORD="$(prompt_password)"
DB_HOST="${MAPMASTER_DB_HOST:-localhost}"
DB_PORT="${MAPMASTER_DB_PORT:-5432}"

if printf "%s" "$DB_PASSWORD" | grep -Eq '[@:/?#\[\]]'; then
  echo "Password contains URL-special characters (@ : / ? # [ ])."
  echo "Use a URL-safe password or extend the script to URL-encode DATABASE_URL."
  exit 1
fi

export MAPMASTER_DB_NAME="$DB_NAME"
export MAPMASTER_DB_USER="$DB_USER"
export MAPMASTER_DB_PASSWORD="$DB_PASSWORD"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

log "Installing base system dependencies..."
apt_install curl git ca-certificates gnupg build-essential

NODE_OK=false
if command_exists node && command_exists npm; then
  NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1 || echo 0)"
  NPM_MAJOR="$(npm -v | cut -d. -f1 || echo 0)"
  if [ "${NODE_MAJOR}" -ge 20 ] && [ "${NPM_MAJOR}" -ge 10 ]; then
    NODE_OK=true
  fi
fi

if [ "${NODE_OK}" = false ]; then
  log "Installing Node.js 20.x (includes npm)..."
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
fi

log "Node version: $(node -v)"
log "npm version:  $(npm -v)"

if ! command_exists psql; then
  log "Installing PostgreSQL..."
  apt_install postgresql postgresql-contrib
fi

if command_exists systemctl; then
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    systemctl enable postgresql || true
    systemctl start postgresql || true
  else
    sudo systemctl enable postgresql || true
    sudo systemctl start postgresql || true
  fi
fi

log "Ensuring PostgreSQL role/database exist..."
ROLE_EXISTS="$(run_as_postgres "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'\"" | tr -d '[:space:]' || true)"
if [ "${ROLE_EXISTS}" != "1" ]; then
  DB_PASSWORD_ESCAPED="$(escape_sql_literal "${DB_PASSWORD}")"
  run_as_postgres "psql -c \"CREATE USER \\\"${DB_USER}\\\" WITH PASSWORD '${DB_PASSWORD_ESCAPED}';\""
else
  # Keep PostgreSQL credentials in sync with the password provided in this setup run.
  DB_PASSWORD_ESCAPED="$(escape_sql_literal "${DB_PASSWORD}")"
  run_as_postgres "psql -c \"ALTER USER \\\"${DB_USER}\\\" WITH PASSWORD '${DB_PASSWORD_ESCAPED}';\""
fi

DB_EXISTS="$(run_as_postgres "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\"" | tr -d '[:space:]' || true)"
if [ "${DB_EXISTS}" != "1" ]; then
  run_as_postgres "createdb -O \"${DB_USER}\" \"${DB_NAME}\""
fi

run_as_postgres "psql -c \"GRANT ALL PRIVILEGES ON DATABASE \\\"${DB_NAME}\\\" TO \\\"${DB_USER}\\\";\""

if [ ! -f ".env.local" ]; then
  log "Creating .env.local from .env.example..."
  cp .env.example .env.local
fi

if grep -q '^DATABASE_URL=' .env.local; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" .env.local
else
  echo "DATABASE_URL=${DATABASE_URL}" >> .env.local
fi

# Prisma CLI reads .env by default (not .env.local), so ensure DATABASE_URL exists there too.
if [ -f ".env" ]; then
  if grep -q '^DATABASE_URL=' .env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" .env
  else
    echo "DATABASE_URL=${DATABASE_URL}" >> .env
  fi
else
  echo "DATABASE_URL=${DATABASE_URL}" > .env
fi

# Also export for current shell execution (covers all Prisma commands in this script).
export DATABASE_URL

if grep -q '^NEXT_PUBLIC_API_URL=' .env.local; then
  sed -i "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://localhost:3000|" .env.local
fi

if grep -q '^API_INTERNAL_URL=' .env.local; then
  sed -i "s|^API_INTERNAL_URL=.*|API_INTERNAL_URL=http://localhost:3000|" .env.local
fi

log "Installing npm dependencies..."
npm install

log "Generating Prisma client..."
npm run prisma:generate

log "Syncing Prisma schema to database..."
npm run db:push

log "Seeding database..."
npm run db:seed

log "Building project..."
npm run build

log "Setup complete."
log "Next steps:"
log "  1) Review .env.local and set real Clerk keys."
log "  2) Start dev server: npm run dev"
log "  3) Start production server: npm run start"
