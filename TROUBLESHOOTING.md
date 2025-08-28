# 🚨 Marketplace Troubleshooting Guide

## Common Issues and Solutions

### 502 Bad Gateway Error

**Problem**: Getting 502 Bad Gateway errors when accessing marketplace API endpoints:
```
POST https://marketplace.w-mirshod.com/api/auth/register 502 (Bad Gateway)
POST https://marketplace.w-mirshod.com/api/auth/token 502 (Bad Gateway)
```

**Root Cause**: Caddy reverse proxy cannot connect to the marketplace backend service.

**Symptoms**:
- API requests return 502 status code
- Frontend shows "Request failed with status code 502"
- Authentication endpoints fail to respond

## 🔧 Solution Steps

### 1. Check Backend Status

Verify the marketplace backend is running on the correct port:

```bash
# Check if backend is running
ps aux | grep "uvicorn app.main:app"

# Test backend locally
curl -s http://localhost:8002/
```

**Expected Output**:
```json
{"message":"Welcome to Marketplace API","version":"1.0.0","docs":"/docs","redoc":"/redoc"}
```

### 2. Verify Port Configuration

Ensure backend and Caddy are using the same port:

**Backend (`run.py`)**:
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8002,  # Must match Caddyfile
        reload=True,
        log_level="info"
    )
```

**Caddyfile**:
```caddy
marketplace.w-mirshod.com {
  @api path /api/*
  reverse_proxy @api 2.59.169.249:8002  # Host IP + Port

  reverse_proxy marketplace-frontend:80
}
```

### 3. Fix Caddy Configuration

**Issue**: Caddy container cannot reach `localhost:8002` on the host machine.

**Solution**: Use the actual host IP address instead of `localhost`:

```bash
# Get host machine IP
hostname -I | awk '{print $1}'

# Update Caddyfile
sed -i 's/localhost:8002/2.59.169.249:8002/g' centralized-caddy/Caddyfile

# Copy to Caddy container
docker cp centralized-caddy/Caddyfile centralized-caddy:/etc/caddy/Caddyfile

# Restart Caddy container
docker restart centralized-caddy
```

### 4. Test the Fix

After applying the fix, test the API:

```bash
# Test main API endpoint
curl -s https://marketplace.w-mirshod.com/api/

# Test auth endpoint
curl -X POST https://marketplace.w-mirshod.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass","role":"client"}'
```

## 🐳 Docker-Specific Issues

### Port Conflicts

**Problem**: Multiple services trying to use the same port.

**Solution**:
```bash
# Check what's using port 8002
netstat -tlnp | grep :8002

# Kill conflicting processes
pkill -f "uvicorn app.main:app"

# Start backend on correct port
cd marketplace
source venv/bin/activate
python run.py
```

### Container Networking

**Problem**: Caddy container cannot reach host services.

**Solutions**:
1. **Use Host IP**: Replace `localhost` with actual host IP
2. **Host Network**: Run Caddy with `--network host`
3. **Extra Hosts**: Add `--add-host=host.docker.internal:host-gateway`

## 🔍 Debugging Commands

### Check Service Status

```bash
# Backend process
ps aux | grep "uvicorn app.main:app"

# Caddy container
docker ps | grep centralized-caddy

# Port usage
netstat -tlnp | grep :8002
```

### Test Connections

```bash
# Test backend locally
curl -s http://localhost:8002/

# Test through Caddy
curl -s https://marketplace.w-mirshod.com/api/

# Check Caddy logs
docker logs centralized-caddy
```

### Verify Configuration

```bash
# Check Caddyfile in container
docker exec centralized-caddy cat /etc/caddy/Caddyfile

# Validate Caddyfile syntax
docker exec centralized-caddy caddy validate --config /etc/caddy/Caddyfile
```

## 📋 Quick Fix Checklist

- [ ] Backend running on port 8002
- [ ] Caddyfile updated with host IP
- [ ] Caddy container restarted
- [ ] Port 8002 not blocked by firewall
- [ ] Backend accessible locally
- [ ] API endpoints responding via HTTPS

## 🚀 Prevention

1. **Always use host IP** instead of `localhost` in Caddyfile
2. **Verify port availability** before starting services
3. **Test locally first** before testing through Caddy
4. **Keep Caddyfile in sync** with backend configuration
5. **Monitor container logs** for connection issues

## 📞 Getting Help

If issues persist:
1. Check backend logs for errors
2. Verify network connectivity
3. Test with different ports
4. Check firewall settings
5. Review Docker network configuration

---

**Last Updated**: August 28, 2025  
**Issue**: 502 Bad Gateway with Caddy reverse proxy  
**Status**: ✅ Resolved
