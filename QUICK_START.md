# 🚀 Quick Start Guide

Get your LogiStream Telemetry API up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need >= 18)
node --version

# Check PostgreSQL (need >= 13)
psql --version

# Check npm
npm --version
```

## Step-by-Step Setup

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Setup Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for local dev)
# The defaults work out of the box with PostgreSQL
```

### 3. Create Database (30 seconds)

```bash
# Option A: Using createdb command
createdb logistream

# Option B: Using psql
psql -U postgres -c "CREATE DATABASE logistream;"

# Option C: Using PostgreSQL GUI (pgAdmin, DBeaver, etc.)
# Create a database named "logistream"
```

### 4. Seed Database (30 seconds)

```bash
npm run seed
```

You should see:
```
✅ Database connected
🌱 Starting database seeding...
✅ Created 6 permissions
✅ Created roles: admin, user
✅ Created users:
   - Admin: admin@example.com / admin123
   - User: user@example.com / user123
🎉 Database seeding completed!
👋 Database connection closed
```

### 5. Start Server (5 seconds)

```bash
npm run dev
```

You should see:
```
[10:00:00.000] INFO: ✅ Database connected successfully
[10:00:00.000] INFO: ✅ DI Container initialized
[10:00:00.000] INFO: Server listening at http://0.0.0.0:3000
```

## ✅ Verify Installation

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2024-12-03T10:00:00.000Z",
  "uptime": 1.234
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "admin123"
  }'
```

Expected:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@example.com",
      "roles": ["admin"]
    }
  },
  "timestamp": "..."
}
```

### Test 3: Get Users (with token)

```bash
# Save token from login response
TOKEN="your-token-here"

curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

## 🎉 Success!

Your API is now running! Here's what you can do next:

### Explore the API

- **Health**: `GET /health`
- **Login**: `POST /api/v1/auth/login`
- **Register**: `POST /api/v1/auth/register`
- **Users**: `GET /api/v1/users` (requires auth)

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |

### Documentation

- [README.md](./README.md) - Complete documentation
- [API_TESTING.md](./API_TESTING.md) - Curl examples
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture details
- [postman_collection.json](./postman_collection.json) - Postman collection

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection settings in .env
cat .env | grep DB_
```

### Port Already in Use

```bash
# Change port in .env
echo "PORT=3001" >> .env

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Rebuild
npm run build
```

## 🔄 Common Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Reseed database
npm run seed

# Run linter
npm run lint
```

## 📱 Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json`
4. Set `baseUrl` variable to `http://localhost:3000`
5. Run the "Login" request
6. Token will be automatically saved for other requests

## 🎯 Next Steps

1. **Read the Documentation**: Check [README.md](./README.md) for complete features
2. **Test the API**: Use [API_TESTING.md](./API_TESTING.md) for examples
3. **Understand the Architecture**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
4. **Customize**: Modify entities, add new features following clean architecture
5. **Deploy**: Build and deploy to your favorite platform

## 💡 Tips

- **Hot Reload**: Changes are automatically reloaded in dev mode
- **Logging**: Check terminal for colorful, structured logs
- **Errors**: All errors are handled and returned in a consistent format
- **Validation**: All inputs are automatically validated using DTOs
- **RBAC**: Routes are protected by roles and permissions
- **Clean Code**: Follow the established patterns in the codebase

## 🆘 Need Help?

- Check error messages in the terminal
- Review logs (structured with Pino)
- Read the documentation files
- Check TypeScript errors with `npm run build`

---

**Congratulations! You're ready to build amazing APIs! 🎉**
