#!/bin/sh
set -e

mkdir -p /app/data
chown -R bun:bun /app/data

echo "Running database migrations..."
su -s /bin/sh bun -c "bun run db:migrate"

echo "Starting server..."
exec su -s /bin/sh bun -c "exec bun run start"
