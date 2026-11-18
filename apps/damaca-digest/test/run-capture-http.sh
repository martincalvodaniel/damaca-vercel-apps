#!/usr/bin/env bash
set -euo pipefail

digest_http_port="${DIGEST_TEST_HTTP_PORT:-3309}"
digest_mongo_port="${DIGEST_TEST_MONGO_PORT:-27017}"
export BETTER_AUTH_URL="http://127.0.0.1:${digest_http_port}"
export BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
export GOOGLE_CLIENT_ID=digest-fixture
export GOOGLE_CLIENT_SECRET=digest-fixture
export ALLOWED_EMAILS=admin@example.com
export MONGODB_URI="mongodb://127.0.0.1:${digest_mongo_port}"
export MONGODB_DB="digest_capture_test_$(date +%s)_$$"
export CHATGPT_CLIENT_ID=digest-test
export CHATGPT_CLIENT_SECRET="$(openssl rand -hex 32)"
export CHATGPT_REDIRECT_URI=https://chatgpt.com/connector/oauth/test
export ARTICLE_FETCH_DIRECT_ENABLED=false ARTICLE_FETCH_JINA_ENABLED=false ARTICLE_FETCH_FIRECRAWL_ENABLED=false

cd "$(dirname "$0")/../../.."
bun run build --filter=@damaca/damaca-digest --cache=local:w -- --webpack
cd apps/damaca-digest

digest_server_log="$(mktemp)"
node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port "$digest_http_port" >"$digest_server_log" 2>&1 &
digest_server_pid=$!
trap 'kill "$digest_server_pid" 2>/dev/null || true; rm -f "$digest_server_log"' EXIT

for ((attempt = 0; attempt < 40; attempt++)); do
  if curl --fail --silent "$BETTER_AUTH_URL/manifest.webmanifest" >/dev/null; then
    if ! bun --no-env-file --conditions=react-server test/capture-http.ts ||
      ! bun --no-env-file --conditions=react-server test/access-http.ts; then
      cat "$digest_server_log"
      exit 1
    fi
    exit 0
  fi
  if ! kill -0 "$digest_server_pid" 2>/dev/null; then break; fi
  sleep 0.25
done
cat "$digest_server_log"
exit 1
