#!/bin/sh
set -e

cd /server/apps/backend

MEDUSA="./node_modules/.bin/medusa"

echo "Running database migrations..."
if [ "${RUN_MIGRATE_ON_START:-true}" = "true" ]; then
  $MEDUSA db:migrate
else
  echo "Skipping db:migrate (RUN_MIGRATE_ON_START=false)"
fi

echo "Starting Medusa development server..."
$MEDUSA develop --no-lint
