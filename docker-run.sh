#!/usr/bin/env bash
# =========================================================================
# 🐳 Farm2Future Platform - Linux/Mac/Cloud VPS Docker Runner
# =========================================================================

set -e

echo "===================================================================="
echo "    🐳 Farm2Future Platform - Docker Container Runner 🐳"
echo "          Powered by Turso Cloud Database (9 GB)"
echo "===================================================================="
echo ""

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed on this machine!"
    echo "Install Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "[BUILD] Building and starting Farm2Future container..."
if docker compose version &> /dev/null; then
    docker compose up --build -d
else
    docker-compose up --build -d
fi

echo ""
echo "===================================================================="
echo "  🎉 Farm2Future Container is LIVE!"
echo "  📍 URL: http://localhost:3000/"
echo "  ☁️ Database: Turso Cloud (9 GB LibSQL Cloud)"
echo "===================================================================="
echo ""
echo "Streaming logs (Press Ctrl+C to stop viewing logs):"
docker logs -f farm2future-platform
