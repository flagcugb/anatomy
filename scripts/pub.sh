#!/usr/bin/env bash
# Pack the Next.js app as a static site and optionally rsync it to a remote directory.
#
#   npm run pack
#   npm run deploy
#   npm run deploy -- --host 1.2.3.4 --user www --path /var/www/anatomy
#
# Copy scripts/deploy.env.example to .env.deploy (gitignored) or pass flags.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT_DIR="$ROOT/out"
OUTPUTS_DIR="$ROOT/outputs"
DEFAULT_LOCALE="en"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_DELETE="${DEPLOY_DELETE:-1}"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/pub.sh pack [--base-path /anatomy]
  bash scripts/pub.sh deploy --host HOST --user USER --path /remote/dir [options]

Options:
  --host HOST          Remote hostname or IP (or DEPLOY_HOST)
  --user USER          SSH user (or DEPLOY_USER)
  --path PATH          Absolute remote directory (or DEPLOY_PATH)
  --port PORT          SSH port (default 22, or DEPLOY_PORT)
  --ssh-key FILE       SSH private key (or DEPLOY_SSH_KEY)
  --base-path PATH     Next.js basePath, e.g. /anatomy (or BASE_PATH)
  --no-delete          Do not pass rsync --delete (or DEPLOY_DELETE=0)
  -h, --help           Show this help

Reads .env.deploy from the project root when present. CLI flags override it.
EOF
}

load_env_file() {
  local env_file="$ROOT/.env.deploy"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

read_default_locale() {
  local extracted
  extracted="$(
    sed -n 's/^export const defaultLocale = "\([^"]*\)";/\1/p' \
      "$ROOT/app/i18n/config.ts"
  )"
  if [[ -n "$extracted" ]]; then
    DEFAULT_LOCALE="$extracted"
  fi
}

normalize_base_path() {
  BASE_PATH="${BASE_PATH:-}"
  BASE_PATH="${BASE_PATH%/}"
  if [[ -n "$BASE_PATH" && "$BASE_PATH" != /* ]]; then
    BASE_PATH="/$BASE_PATH"
  fi
}

assert_safe_remote_path() {
  local path="$1"
  local blocked=(
    /
    /bin /boot /dev /etc /home /lib /lib64 /opt /proc /root /sbin /sys /tmp /usr /var
  )

  if [[ -z "$path" ]]; then
    echo "error: remote path is empty (set DEPLOY_PATH or --path)" >&2
    exit 1
  fi
  if [[ "$path" != /* ]]; then
    echo "error: remote path must be absolute: $path" >&2
    exit 1
  fi
  if [[ "$path" == *\'* || "$path" == *$'\n'* ]]; then
    echo "error: remote path must not contain quotes or newlines" >&2
    exit 1
  fi

  local candidate
  for candidate in "${blocked[@]}"; do
    if [[ "$path" == "$candidate" ]]; then
      echo "error: refusing to publish to system directory: $path" >&2
      exit 1
    fi
  done
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: missing required command: $1" >&2
    exit 1
  fi
}

write_root_redirect() {
  local dest="${BASE_PATH}/${DEFAULT_LOCALE}/"
  cat >"$OUT_DIR/index.html" <<EOF
<!DOCTYPE html>
<html lang="${DEFAULT_LOCALE}">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${dest}" />
    <link rel="canonical" href="${dest}" />
    <title>Redirecting</title>
    <script>location.replace(${dest@Q});</script>
  </head>
  <body>
    <a href="${dest}">Continue</a>
  </body>
</html>
EOF
}

pack() {
  require_cmd npm
  read_default_locale
  normalize_base_path

  if [[ ! -d "$ROOT/public/models" ]]; then
    echo "warning: public/models is missing; GLB models will 404 on the live site" >&2
  fi
  if [[ ! -d "$ROOT/public/anatomy" ]]; then
    echo "warning: public/anatomy is missing; organ illustrations will 404 on the live site" >&2
  fi

  echo "Building static export (locale=${DEFAULT_LOCALE}, basePath=${BASE_PATH:-<none>})"
  STATIC_EXPORT=1 BASE_PATH="$BASE_PATH" NEXT_PUBLIC_BASE_PATH="$BASE_PATH" npm run build:next

  if [[ ! -d "$OUT_DIR" ]]; then
    echo "error: expected static output directory $OUT_DIR" >&2
    exit 1
  fi

  write_root_redirect

  mkdir -p "$OUTPUTS_DIR"
  local stamp tarball
  stamp="$(date +%Y%m%d%H%M%S)"
  tarball="$OUTPUTS_DIR/anatomy-static-${stamp}.tar.gz"
  tar -czf "$tarball" -C "$OUT_DIR" .
  echo "Packed $OUT_DIR -> $tarball"
}

deploy() {
  require_cmd ssh
  require_cmd rsync

  : "${DEPLOY_HOST:?error: DEPLOY_HOST or --host is required}"
  : "${DEPLOY_USER:?error: DEPLOY_USER or --user is required}"
  : "${DEPLOY_PATH:?error: DEPLOY_PATH or --path is required}"
  DEPLOY_PORT="${DEPLOY_PORT:-22}"

  assert_safe_remote_path "$DEPLOY_PATH"
  pack

  local ssh_cmd=(ssh -p "$DEPLOY_PORT")
  if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
    ssh_cmd+=(-i "$DEPLOY_SSH_KEY")
  fi

  local rsync_args=(-avz)
  if [[ "$DEPLOY_DELETE" != "0" ]]; then
    rsync_args+=(--delete)
  fi

  echo "Publishing $OUT_DIR/ -> ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
  rsync "${rsync_args[@]}" \
    -e "${ssh_cmd[*]}" \
    --rsync-path="mkdir -p '${DEPLOY_PATH}' && rsync" \
    "$OUT_DIR"/ \
    "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
  echo "Deployed to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
}

load_env_file

COMMAND="${1:-}"
if [[ $# -gt 0 ]]; then
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      DEPLOY_HOST="${2:?error: --host requires a value}"
      shift 2
      ;;
    --user)
      DEPLOY_USER="${2:?error: --user requires a value}"
      shift 2
      ;;
    --path)
      DEPLOY_PATH="${2:?error: --path requires a value}"
      shift 2
      ;;
    --port)
      DEPLOY_PORT="${2:?error: --port requires a value}"
      shift 2
      ;;
    --ssh-key)
      DEPLOY_SSH_KEY="${2:?error: --ssh-key requires a value}"
      shift 2
      ;;
    --base-path)
      BASE_PATH="${2:?error: --base-path requires a value}"
      shift 2
      ;;
    --no-delete)
      DEPLOY_DELETE=0
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

case "$COMMAND" in
  pack) pack ;;
  deploy) deploy ;;
  -h | --help | "")
    usage
    [[ "$COMMAND" == "-h" || "$COMMAND" == "--help" ]]
    exit $?
    ;;
  *)
    echo "error: unknown command: $COMMAND" >&2
    usage >&2
    exit 1
    ;;
esac
