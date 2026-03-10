#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/scripts/docker-compose.local.yml"

docker compose -f "$COMPOSE_FILE" down