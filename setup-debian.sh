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

npm_install_global() {
  local package_name="$1"
  local npm_prefix=""
  local global_modules_dir=""

  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    npm install -g "$package_name"
  else
    npm_prefix="$(npm config get prefix 2>/dev/null || echo "/usr")"
    global_modules_dir="${npm_prefix%/}/lib/node_modules"

    if [ -d "$global_modules_dir" ] && [ -w "$global_modules_dir" ]; then
      npm install -g "$package_name"
      return
    fi

    if command_exists sudo; then
      sudo npm install -g "$package_name"
      return
    fi

    echo "Global npm install requires elevated permissions, but sudo is unavailable."
    echo "Please run this script as root or install sudo for user-level setup."
    exit 1
  fi
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

url_encode() {
  local raw="$1"
  local encoded=""
  local i c hex
  LC_ALL=C
  for ((i = 0; i < ${#raw}; i++)); do
    c="${raw:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) encoded+="$c" ;;
      *)
        printf -v hex '%%%02X' "'$c"
        encoded+="$hex"
        ;;
    esac
  done
  printf "%s" "$encoded"
}

set_env_var() {
  local file_path="$1"
  local key="$2"
  local value="$3"
  local tmp_file

  if [ ! -f "$file_path" ]; then
    printf "%s=%s\n" "$key" "$value" > "$file_path"
    return
  fi

  tmp_file="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    BEGIN { updated = 0 }
    $0 ~ ("^" key "=") {
      print key "=" value
      updated = 1
      next
    }
    { print }
    END {
      if (updated == 0) {
        print key "=" value
      }
    }
  ' "$file_path" > "$tmp_file"
  mv "$tmp_file" "$file_path"
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
DB_PASSWORD_URLENC="$(url_encode "$DB_PASSWORD")"

export MAPMASTER_DB_NAME="$DB_NAME"
export MAPMASTER_DB_USER="$DB_USER"
export MAPMASTER_DB_PASSWORD="$DB_PASSWORD"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_URLENC}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

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

# Verify password authentication over TCP before running Prisma.
auth_ok=false
for attempt in 1 2 3; do
  if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" >/dev/null 2>&1; then
    auth_ok=true
    break
  fi

  echo "PostgreSQL authentication test failed for user '${DB_USER}' on ${DB_HOST}:${DB_PORT}/${DB_NAME}."
  if [ "$attempt" -lt 3 ]; then
    echo "Please re-enter database password."
    DB_PASSWORD="$(prompt_password)"
    DB_PASSWORD_URLENC="$(url_encode "$DB_PASSWORD")"
    export MAPMASTER_DB_PASSWORD="$DB_PASSWORD"
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_URLENC}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    DB_PASSWORD_ESCAPED="$(escape_sql_literal "${DB_PASSWORD}")"
    run_as_postgres "psql -c \"ALTER USER \\\"${DB_USER}\\\" WITH PASSWORD '${DB_PASSWORD_ESCAPED}';\""
  fi
done

if [ "${auth_ok}" != true ]; then
  echo "Unable to authenticate to PostgreSQL after 3 attempts. Exiting."
  exit 1
fi

if [ ! -f ".env.local" ]; then
  log "Creating .env.local from .env.example..."
  cp .env.example .env.local
fi

set_env_var ".env.local" "DATABASE_URL" "${DATABASE_URL}"

# Prisma CLI reads .env by default (not .env.local), so ensure DATABASE_URL exists there too.
set_env_var ".env" "DATABASE_URL" "${DATABASE_URL}"

# Also export for current shell execution (covers all Prisma commands in this script).
export DATABASE_URL

set_env_var ".env.local" "NEXT_PUBLIC_API_URL" "http://localhost:3000"
set_env_var ".env.local" "API_INTERNAL_URL" "http://localhost:3000"

if [ -z "${AUTH_JWT_SECRET:-}" ]; then
  if command_exists openssl; then
    AUTH_JWT_SECRET="$(openssl rand -hex 32)"
  else
    AUTH_JWT_SECRET="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  fi
fi
set_env_var ".env.local" "AUTH_JWT_SECRET" "${AUTH_JWT_SECRET}"
set_env_var ".env" "AUTH_JWT_SECRET" "${AUTH_JWT_SECRET}"

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

log "Installing PM2..."
npm_install_global pm2

if ! command_exists pm2; then
  echo "PM2 installation completed, but 'pm2' is not in PATH. Re-login and retry."
  exit 1
fi

log "Starting app with PM2..."
pm2 delete mapmaster >/dev/null 2>&1 || true
pm2 start npm --name mapmaster -- start
pm2 save >/dev/null 2>&1 || true

log "Setup complete."
log "Next steps:"
log "  1) App is running under PM2 process name: mapmaster"
log "  2) Check status: pm2 status"
log "  3) View logs: pm2 logs mapmaster"
log "  4) Restart app: pm2 restart mapmaster"
