#!/bin/sh
set -e

cd /server/apps/storefront

echo "Waiting for Medusa backend..."
i=0
until wget -qO- http://medusa:9000/health >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 90 ]; then
    echo "Medusa did not become healthy in time; starting storefront anyway..."
    break
  fi
  sleep 2
done

echo "Starting Next.js storefront..."
./node_modules/.bin/next dev --turbopack -H 0.0.0.0 -p 8000
