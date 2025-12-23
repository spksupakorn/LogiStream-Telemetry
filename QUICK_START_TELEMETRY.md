# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Docker installed (`docker --version`)
- ✅ Docker Compose installed (`docker-compose --version`)

## 5-Minute Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd LogiStream-Telemetry
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 3. Start Infrastructure
```bash
docker-compose up -d
# Wait ~30 seconds for services to be ready
docker-compose ps  # Check all services are healthy
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Start Application
```bash
npm run dev
```

### 6. Verify It's Working

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T...",
  "uptime": 1.234
}
```

## Test Telemetry Ingestion

### Single Event
```bash
curl -X POST http://localhost:3000/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-001",
    "truckId": "truck-001",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "temperature": -5,
    "humidity": 45,
    "speed": 60
  }'
```

### Batch Events
```bash
curl -X POST http://localhost:3000/api/v1/telemetry/batch \
  -H "Content-Type: application/json" \
  -d '{
    "telemetry": [
      {
        "deviceId": "device-001",
        "truckId": "truck-001",
        "latitude": 13.7563,
        "longitude": 100.5018,
        "temperature": -5,
        "humidity": 45
      },
      {
        "deviceId": "device-002",
        "truckId": "truck-002",
        "latitude": 14.0583,
        "longitude": 100.6033,
        "temperature": -3,
        "humidity": 50
      }
    ]
  }'
```

## Monitor Messages in Kafka

Open Kafka UI in your browser:
```
http://localhost:8080
```

Navigate to Topics → `telemetry-events` to see ingested messages.

## View API Documentation

Open Swagger UI in your browser:
```
http://localhost:3000/documentation
```

## Run Tests

```bash
npm test
```

## Common Issues

### Port Already in Use
If port 3000 is already in use:
```bash
# Change PORT in .env
PORT=3001
```

### Docker Services Not Starting
```bash
# Check Docker is running
docker ps

# Restart services
docker-compose down
docker-compose up -d
```

### Kafka Connection Failed
```bash
# Check Kafka is healthy
docker-compose ps kafka

# Wait for Kafka to be ready (can take 30-60 seconds)
docker-compose logs -f kafka
```

### MongoDB Connection Failed
```bash
# Check MongoDB is healthy
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb
```

## Stop Everything

```bash
# Stop application (Ctrl+C in terminal)

# Stop Docker services
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Next Steps

- Read the full [README.md](./README.md) for architecture details
- Explore the [API documentation](http://localhost:3000/documentation)
- Check out the [test suite](./tests/IngestTelemetryUseCase.spec.ts)
- Review the [project structure](./PROJECT_STRUCTURE.md)

## Development Workflow

1. Make changes to code
2. Server auto-reloads (using `tsx watch`)
3. Test your changes:
   ```bash
   npm test
   ```
4. Check API in Swagger UI
5. Monitor Kafka messages in Kafka UI

Happy coding! 🚀
