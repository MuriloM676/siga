#!/bin/bash

echo "=== Container Status ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "=== Backend Logs (last 50 lines) ==="
docker logs siga-backend --tail 50 2>&1

echo ""
echo "=== Frontend Logs (last 30 lines) ==="
docker logs siga-frontend --tail 30 2>&1

echo ""
echo "=== Testing Connections ==="
echo -n "Frontend (3000): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "FAIL"

echo -n "Backend (3001): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1 || echo "FAIL"
