#!/bin/bash
echo "=== Container Status ==="
docker ps -a --format "table {{.Names}}\t{{.State}}\t{{.Status}}"
echo ""
echo "=== Backend Logs (Last 30 lines) ==="
docker logs siga-backend --tail 30 2>&1
echo ""
echo "=== Frontend Logs (Last 30 lines) ==="
docker logs siga-frontend --tail 30 2>&1
