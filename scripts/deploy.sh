#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") [dev|prod|both]

Environment variables (optional):
  TURNSTILE_SITE_KEY         Public site key used in bdd.html (Turnstile widget)
  TURNSTILE_SECRET_VALUE     Private secret for Turnstile verification (stored in the Worker)
  API_SHARED_SECRET_VALUE    Shared secret protecting POST requests (stored in the Worker)

If TURNSTILE_SITE_KEY is not provided, the script reads ~/.ssh/id_ed25519.pub.
If TURNSTILE_SECRET_VALUE or API_SHARED_SECRET_VALUE are missing, random values are generated.

The script will:
  1. Temporarily inject the Turnstile site key into bdd.html
  2. Push the secrets to Cloudflare Workers (prod and/or dev)
  3. Deploy the Worker via wrangler
After completion the local bdd.html is restored.
USAGE
}

ENVIRONMENT=${1:-both}
if [[ ! $ENVIRONMENT =~ ^(dev|prod|both)$ ]]; then
  usage
  exit 1
fi

if [[ -z "${TURNSTILE_SITE_KEY:-}" ]]; then
  if [[ -f "$HOME/.ssh/id_ed25519.pub" ]]; then
    TURNSTILE_SITE_KEY=$(cat "$HOME/.ssh/id_ed25519.pub")
    echo "TURNSTILE_SITE_KEY sourced from ~/.ssh/id_ed25519.pub"
  else
    echo "TURNSTILE_SITE_KEY not set and ~/.ssh/id_ed25519.pub missing" >&2
    exit 1
  fi
fi

if [[ -z "${TURNSTILE_SECRET_VALUE:-}" ]]; then
  TURNSTILE_SECRET_VALUE=$(openssl rand -hex 32)
  echo "Generated TURNSTILE_SECRET_VALUE automatically"
fi

if [[ -z "${API_SHARED_SECRET_VALUE:-}" ]]; then
  API_SHARED_SECRET_VALUE=$(openssl rand -hex 32)
  echo "Generated API_SHARED_SECRET_VALUE automatically"
fi

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BDD_FILE="$ROOT_DIR/bdd.html"
WORKER_DIR="$ROOT_DIR/workers-argumentaires"
WRANGLER_CONFIG="$ROOT_DIR/wrangler.toml"

if [[ ! -d "$WORKER_DIR" ]]; then
  echo "Cannot find Cloudflare Worker project at $WORKER_DIR" >&2
  exit 1
fi

if [[ ! -f "$WRANGLER_CONFIG" ]]; then
  echo "Cannot find wrangler configuration at $WRANGLER_CONFIG" >&2
  exit 1
fi

if [[ -x "$WORKER_DIR/node_modules/.bin/wrangler" ]]; then
  WRANGLER_CMD=("$WORKER_DIR/node_modules/.bin/wrangler")
elif command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD=(wrangler)
elif command -v npm >/dev/null 2>&1; then
  WRANGLER_CMD=(npm exec -- wrangler)
else
  echo "wrangler CLI not found. Install dependencies with 'npm install' in $WORKER_DIR" >&2
  exit 1
fi

run_wrangler() {
  (
    cd "$ROOT_DIR"
    "${WRANGLER_CMD[@]}" --config "$WRANGLER_CONFIG" "$@"
  )
}

if [[ ! -f "$BDD_FILE" ]]; then
  echo "Cannot find bdd.html at $BDD_FILE" >&2
  exit 1
fi

TMP_BDD=$(mktemp)
cp "$BDD_FILE" "$TMP_BDD"
cleanup() {
  mv "$TMP_BDD" "$BDD_FILE"
}
trap cleanup EXIT

python3 - "$BDD_FILE" "$TURNSTILE_SITE_KEY" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
site_key = sys.argv[2]
text = path.read_text()
if 'YOUR_TURNSTILE_SITE_KEY' in text:
    updated = text.replace('YOUR_TURNSTILE_SITE_KEY', site_key)
    path.write_text(updated)
PY

push_secret() {
  local name=$1
  local value=$2
  shift 2
  local env_args=("$@")
  if [[ -n "$value" ]]; then
    printf '%s' "$value" | run_wrangler secret put "$name" "${env_args[@]}"
  fi
}

set -x

run_prod=false
run_dev=false
if [[ $ENVIRONMENT == "prod" || $ENVIRONMENT == "both" ]]; then
  run_prod=true
fi
if [[ $ENVIRONMENT == "dev" || $ENVIRONMENT == "both" ]]; then
  run_dev=true
fi

if [[ $run_prod == true ]]; then
  push_secret TURNSTILE_SECRET "$TURNSTILE_SECRET_VALUE"
  push_secret API_SHARED_SECRET "$API_SHARED_SECRET_VALUE"
  run_wrangler deploy
fi

if [[ $run_dev == true ]]; then
  push_secret TURNSTILE_SECRET "$TURNSTILE_SECRET_VALUE" --env dev
  push_secret API_SHARED_SECRET "$API_SHARED_SECRET_VALUE" --env dev
  run_wrangler deploy --env dev
fi

set +x
trap - EXIT
mv "$TMP_BDD" "$BDD_FILE"

cat <<SUMMARY
Deployment completed.
Remember to commit any intentional changes and trigger a Cloudflare Pages build (git push) if required.
SUMMARY
