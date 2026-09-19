#!/usr/bin/env bash
set -euo pipefail
AI_URL="${AI_SERVICE_URL:-http://127.0.0.1:8000}"
AI_KEY="${AI_API_KEY:-siedes-local-dev-key}"
echo "[1/4] AI health"
curl -fsS "$AI_URL/health"; echo
echo "[2/4] AI ready"
curl -fsS "$AI_URL/ready"; echo
echo "[3/4] AI model"
curl -fsS -H "X-API-Key: $AI_KEY" "$AI_URL/model/info" >/dev/null; echo "OK"
echo "[4/4] AI institutions"
curl -fsS -H "X-API-Key: $AI_KEY" "$AI_URL/institutions" >/dev/null; echo "OK"
echo "SIEDES AI disponible para NestJS."
