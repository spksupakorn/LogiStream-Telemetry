# API Testing Guide

This document provides curl examples for testing all API endpoints.

## Setup

First, set your base URL:
```bash
BASE_URL="http://localhost:3000"
```

## 1. Health Check

```bash
curl -X GET "$BASE_URL/health"
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-03T10:00:00.000Z",
  "uptime": 123.45
}
```

## 2. Authentication

### Register a New User

```bash
curl -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "roleNames": ["user"]
  }'
```

### Login (Get Access Token)

```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "admin123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "roles": ["admin"]
    }
  },
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

Save the access token for subsequent requests:
```bash
TOKEN="eyJhbGc..."
```

### Login as Regular User

```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "user123"
  }'
```

## 3. User Management

### Get All Users (Admin Only)

```bash
curl -X GET "$BASE_URL/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "isActive": true,
      "roles": ["admin"],
      "createdAt": "2024-12-03T10:00:00.000Z",
      "updatedAt": "2024-12-03T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  },
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

### Get User by ID

```bash
USER_ID="your-user-uuid-here"

curl -X GET "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Create New User (Admin Only)

```bash
curl -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "User",
    "roleNames": ["user"]
  }'
```

### Update User

```bash
USER_ID="your-user-uuid-here"

curl -X PATCH "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "isActive": true
  }'
```

### Delete User (Admin Only)

```bash
USER_ID="your-user-uuid-here"

curl -X DELETE "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Error Responses

### Validation Error (Missing Required Fields)

```bash
curl -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "a"
  }'
```

Expected Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "username": ["username must be longer than or equal to 3 characters"],
      "email": ["email must be an email"],
      "password": ["password should not be empty"]
    },
    "path": "/api/v1/auth/register"
  },
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

### Unauthorized Error (No Token)

```bash
curl -X GET "$BASE_URL/api/v1/users"
```

Expected Response:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided",
    "timestamp": "2024-12-03T10:00:00.000Z",
    "path": "/api/v1/users"
  },
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

### Forbidden Error (Insufficient Permissions)

```bash
# Login as regular user first
TOKEN_USER="user-token-here"

# Try to create user (admin only)
curl -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -d '{
    "username": "forbidden",
    "email": "forbidden@example.com",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Required roles: admin",
    "timestamp": "2024-12-03T10:00:00.000Z",
    "path": "/api/v1/users"
  },
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

### Not Found Error

```bash
curl -X GET "$BASE_URL/api/v1/users/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "timestamp": "2024-12-03T10:00:00.000Z",
    "path": "/api/v1/users/00000000-0000-0000-0000-000000000000"
  },
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

## 5. Complete Testing Flow

### Step 1: Health Check
```bash
curl -X GET "$BASE_URL/health"
```

### Step 2: Login as Admin
```bash
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@example.com", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
echo "Token: $TOKEN"
```

### Step 3: Get All Users
```bash
curl -X GET "$BASE_URL/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Step 4: Create New User
```bash
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "apitest",
    "email": "apitest@example.com",
    "password": "test123456",
    "firstName": "API",
    "lastName": "Test",
    "roleNames": ["user"]
  }')

USER_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')
echo "Created User ID: $USER_ID"
```

### Step 5: Get User by ID
```bash
curl -X GET "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Step 6: Update User
```bash
curl -X PATCH "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Updated API",
    "lastName": "Updated Test"
  }' | jq
```

### Step 7: Delete User
```bash
curl -X DELETE "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- All timestamps are in ISO 8601 format
- All endpoints return JSON
- Authentication uses Bearer tokens
- Tokens expire after 15 minutes by default
- Use `jq` for pretty-printing JSON responses
- Replace `$TOKEN` with actual JWT token in production

## Default Test Users

After running `npm run seed`:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@example.com | admin123 | admin |
| user | user@example.com | user123 | user |
