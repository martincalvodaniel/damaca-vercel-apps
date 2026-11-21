#!/usr/bin/env bash
set -euo pipefail

digest_port="${DIGEST_TEST_MONGO_PORT:-37031}"
digest_container="$(docker run --rm -d -p "127.0.0.1:${digest_port}:27017" mongo:8 --replSet digest-test --bind_ip_all)"
trap 'docker stop "$digest_container" >/dev/null' EXIT

digest_mongo() {
  docker exec "$digest_container" mongosh --quiet --eval "$1"
}

for ((attempt = 0; attempt < 60; attempt++)); do
  if digest_mongo 'db.adminCommand({ ping: 1 }).ok' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

digest_mongo 'rs.initiate({_id:"digest-test",members:[{_id:0,host:"localhost:27017"}]})'
for ((attempt = 0; attempt < 60; attempt++)); do
  if digest_mongo 'quit(db.hello().isWritablePrimary ? 0 : 1)' >/dev/null 2>&1; then
    DIGEST_TEST_MONGO_PORT="$digest_port" bash "$(dirname "$0")/run-capture-http.sh"
    exit
  fi
  sleep 1
done
exit 1
