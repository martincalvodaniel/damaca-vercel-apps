#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
app_dir="$repo_root/apps/dalis-home-management"
http_port="${DALIS_MCP_TEST_HTTP_PORT:-3317}"
mongo_port="${DALIS_MCP_TEST_MONGO_PORT:-27117}"
container="dalis-mcp-test-$$"
server_log="$(mktemp)"
server_pid=""
cleanup() {
  if [[ -n "$server_pid" ]]; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -f "$server_log"
}
trap cleanup EXIT

docker run --rm --pull never -d --name "$container"   -p "127.0.0.1:$mongo_port:27017" mongo:8 >/dev/null

export MONGODB_URI="mongodb://127.0.0.1:$mongo_port/?directConnection=true"
export MONGODB_DB="dalis_mcp_test_$$"
export BETTER_AUTH_URL="http://127.0.0.1:$http_port"
export BETTER_AUTH_SECRET="local-test-secret-not-used-outside-the-fixture"
export GOOGLE_CLIENT_ID="fixture-google-client"
export GOOGLE_CLIENT_SECRET="fixture-google-secret"
export ALLOWED_EMAILS="allowed@example.com"
export MCP_OAUTH_CLIENTS='[{"id":"dalis-test","secret":"local-fixture-client-secret-of-at-least-32-characters","redirectUri":"https://example.com/oauth/callback"}]'

cd "$repo_root"
bun run build --filter=@damaca/dalis-home-management --force
cd "$app_dir"
bun --bun ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port "$http_port" >"$server_log" 2>&1 &
server_pid=$!
for (( attempt=0; attempt<40; attempt++ )); do
  if curl -fsS "$BETTER_AUTH_URL/auth/signin" >/dev/null 2>&1; then
    if ! bun --no-env-file --conditions=react-server test/menu-mcp-http.ts; then
      cat "$server_log"
      exit 1
    fi
    exit 0
  fi
  sleep 1
done
cat "$server_log"
exit 1
