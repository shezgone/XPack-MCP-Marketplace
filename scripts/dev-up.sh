#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/scripts/docker-compose.local.yml"

docker compose -f "$COMPOSE_FILE" up -d
docker compose -f "$COMPOSE_FILE" ps

echo "MySQL:      127.0.0.1:33306"
echo "Redis:      127.0.0.1:6379"
echo "RabbitMQ:   127.0.0.1:5672"
echo "RabbitMQ UI http://127.0.0.1:15672"