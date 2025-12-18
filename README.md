# LogiStream - Telemetry Ingest Service

A high-performance telemetry ingestion service for refrigerated truck fleets, demonstrating the **Fire-and-Forget** pattern using modern backend technologies.

## 🎯 Project Overview

LogiStream is a real-time telemetry ingestion service designed to handle thousands of IoT events per second from refrigerated trucks. The service validates incoming GPS, temperature, and humidity data, then publishes events to Kafka for asynchronous processing without blocking the API.

### Key Features

- **High-Throughput Ingestion**: Process thousands of telemetry events per second
- **Fire-and-Forget Pattern**: Immediate API response with async processing via Kafka
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Dependency Injection**: Using Inversify for loose coupling and testability
- **Real-Time Alerts**: Automatic detection of temperature and humidity anomalies
- **Batch Processing**: Support for bulk telemetry ingestion
- **Comprehensive Testing**: Unit tests with Jest following best practices

## 🏗️ Architecture

### Technology Stack

- **Web Framework**: [Fastify](https://www.fastify.io/) - High-performance web framework
- **Dependency Injection**: [Inversify](https://inversify.io/) - IoC container
- **Message Queue**: [KafkaJS](https://kafka.js.org/) - Apache Kafka client
- **Database (Postgres)**: [TypeORM](https://typeorm.io/) - User authentication & authorization
- **Database (MongoDB)**: [Mongoose](https://mongoosejs.com/) - Telemetry data storage
- **Testing**: [Jest](https://jestjs.io/) - Unit testing framework
- **Validation**: [@sinclair/typebox](https://github.com/sinclairzx81/typebox) - Schema validation

### Clean Architecture Layers

```
src/
├── domain/                    # Business logic layer
│   ├── entities/             # Domain entities (Telemetry, User, etc.)
│   ├── repositories/         # Repository interfaces
│   └── services/             # Domain services interfaces
│
├── application/              # Use cases layer
│   ├── use-cases/           # Business use cases
│   ├── mappers/             # Data mappers
│   └── types/               # Application types
│
├── infrastructure/           # External concerns
│   ├── database/            # Database connections & models
│   ├── repositories/        # Repository implementations
│   ├── messaging/           # Kafka implementation
│   ├── config/              # Configuration service
│   └── di/                  # Dependency injection container
│
├── presentation/            # API layer
│   ├── controllers/        # HTTP controllers
│   ├── routes/             # Route definitions
│   ├── schemas/            # Request/response schemas
│   └── middlewares/        # Authentication, authorization, etc.
│
└── plugins/                # Fastify plugins
    ├── config.ts           # Environment configuration
    ├── database.ts         # PostgreSQL connection
    ├── mongoose.ts         # MongoDB connection
    ├── kafka.ts            # Kafka connection
    ├── di.ts               # DI container
    ├── cors.ts             # CORS configuration
    └── swagger.ts          # API documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LogiStream-Telemetry.git
   cd LogiStream-Telemetry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server
   NODE_ENV=development
   HOST=0.0.0.0
   PORT=3000

   # PostgreSQL (for user auth)
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=logistream
   DB_USER=postgres
   DB_PASSWORD=postgres

   # MongoDB (for telemetry data)
   MONGO_URI=mongodb://admin:admin123@localhost:27017/telemetry?authSource=admin

   # Kafka
   KAFKA_BROKERS=localhost:29092
   KAFKA_CLIENT_ID=logistream-telemetry

   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
   ```

4. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL (port 5432)
   - MongoDB (port 27017)
   - Zookeeper (port 2181)
   - Kafka (ports 9092, 29092)
   - Kafka UI (port 8080)

5. **Wait for services to be healthy**
   ```bash
   docker-compose ps
   ```

6. **Run database migrations and seed data**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

### Verify Installation

1. **Check health endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check telemetry service health**
   ```bash
   curl http://localhost:3000/api/v1/telemetry/health
   ```

3. **Access Swagger documentation**
   
   Open `http://localhost:3000/documentation` in your browser

4. **Access Kafka UI**
   
   Open `http://localhost:8080` in your browser to monitor Kafka topics and messages

## 📊 API Documentation

### Telemetry Endpoints

#### POST /api/v1/telemetry

Ingest a single telemetry event (Fire-and-Forget).

**Request Body:**
```json
{
  "deviceId": "device-001",
  "truckId": "truck-001",
  "latitude": 13.7563,
  "longitude": 100.5018,
  "temperature": -5,
  "humidity": 45,
  "speed": 60,
  "altitude": 50,
  "timestamp": "2025-12-18T10:00:00Z"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Telemetry data ingested successfully",
  "data": {
    "telemetry": {
      "deviceId": "device-001",
      "truckId": "truck-001",
      "timestamp": "2025-12-18T10:00:00.000Z",
      "needsAlert": false
    }
  }
}
```

#### POST /api/v1/telemetry/batch

Ingest multiple telemetry events in a single request (up to 1000).

**Request Body:**
```json
{
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
      "latitude": 13.7563,
      "longitude": 100.5018,
      "temperature": -3,
      "humidity": 50
    }
  ]
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Batch telemetry ingestion completed",
  "data": {
    "ingested": 2,
    "failed": 0
  }
}
```

### Validation Rules

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| deviceId | string | Yes | - | Unique device identifier |
| truckId | string | Yes | - | Truck identifier |
| latitude | number | Yes | -90 to 90 | GPS latitude in degrees |
| longitude | number | Yes | -180 to 180 | GPS longitude in degrees |
| temperature | number | Yes | -40 to 40 | Temperature in Celsius |
| humidity | number | Yes | 0 to 100 | Humidity percentage |
| timestamp | string | No | ISO 8601 | Event timestamp (defaults to now) |
| speed | number | No | 0 to 200 | Speed in km/h |
| altitude | number | No | -500 to 9000 | Altitude in meters |

### Alert Conditions

- **Temperature Alert**: Temperature < -20°C or > 5°C
- **Humidity Alert**: Humidity > 80%

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Structure

```
tests/
└── IngestTelemetryUseCase.spec.ts    # Use case unit tests
```

The test suite includes:
- ✅ Valid data ingestion
- ✅ Validation of all input fields
- ✅ Timestamp handling (provided, default, future)
- ✅ Alert detection (temperature, humidity)
- ✅ Error handling
- ✅ Batch processing
- ✅ Fire-and-forget pattern verification

## 🔄 Fire-and-Forget Pattern

The service implements a fire-and-forget pattern for high throughput:

1. **Receive Request**: API receives telemetry data
2. **Validate**: Domain entity validates business rules
3. **Publish to Kafka**: Message published to Kafka immediately (fast)
4. **Respond**: API returns 202 Accepted without waiting
5. **Persist Async**: Database save happens asynchronously (fire-and-forget)

```typescript
// Publish to Kafka first (primary action)
await this.messageBus.publishTelemetry(telemetry);

// Persist to database asynchronously (fire-and-forget)
this.telemetryRepository.save(telemetry).catch(error => {
  console.error('Failed to persist:', error);
});
```

### Benefits

- **High Throughput**: API doesn't wait for database writes
- **Resilience**: Kafka ensures message delivery even if database is down
- **Scalability**: Consumers can process messages at their own pace
- **Decoupling**: Processing logic separated from ingestion

## 🛠️ Development

### Project Scripts

```bash
npm run dev              # Start development server with watch mode
npm run dev:no-watch     # Start development server without watch
npm run build            # Compile TypeScript to JavaScript
npm run start            # Start production server
npm run seed             # Seed database with initial data
npm run lint             # Run ESLint
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
```

### Adding New Features

1. **Domain Entity**: Create entity in `src/domain/entities/`
2. **Repository Interface**: Define interface in `src/domain/repositories/`
3. **Repository Implementation**: Implement in `src/infrastructure/repositories/`
4. **Use Case**: Create use case in `src/application/use-cases/`
5. **Controller**: Add controller in `src/presentation/controllers/`
6. **Routes**: Define routes in `src/presentation/routes/`
7. **Schemas**: Add validation schemas in `src/presentation/schemas/`
8. **DI Container**: Register in `src/infrastructure/di/container.ts`
9. **Tests**: Add tests in `tests/`

## 📦 Docker Support

### Using Docker Compose

The `docker-compose.yaml` provides all infrastructure services:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Services Included

- **PostgreSQL**: User authentication database
- **MongoDB**: Telemetry data storage
- **Zookeeper**: Kafka coordination
- **Kafka**: Message broker
- **Kafka UI**: Web UI for Kafka monitoring

## 🔍 Monitoring

### Kafka UI

Access Kafka UI at `http://localhost:8080` to:
- View topics and messages
- Monitor consumer groups
- Check message throughput
- Inspect message contents

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Telemetry service health
curl http://localhost:3000/api/v1/telemetry/health

# Check Docker services
docker-compose ps
```

## 🏗️ Design Patterns

### 1. Clean Architecture
- Separation of concerns across layers
- Dependency inversion (dependencies point inward)
- Framework-independent business logic

### 2. Dependency Injection
- Inversify container for IoC
- Constructor injection
- Interface-based programming

### 3. Repository Pattern
- Abstract data access
- Testable with mocks
- Swappable implementations

### 4. Use Case Pattern
- Single responsibility
- Business logic encapsulation
- Testable in isolation

### 5. Fire-and-Forget
- Non-blocking operations
- Async message processing
- High throughput

## 🧩 Key Components

### Telemetry Entity
Domain entity with built-in validation and business rules.

```typescript
const telemetry = Telemetry.create({
  deviceId: 'device-001',
  truckId: 'truck-001',
  latitude: 13.7563,
  longitude: 100.5018,
  temperature: -5,
  humidity: 45,
  timestamp: new Date()
});

if (telemetry.needsAlert()) {
  // Handle alert
}
```

### IngestTelemetryUseCase
Core business logic for telemetry ingestion.

```typescript
@injectable()
export class IngestTelemetryUseCase {
  constructor(
    @inject(TYPES.ITelemetryRepository) private repository,
    @inject(TYPES.IMessageBus) private messageBus
  ) {}

  async execute(input: IngestTelemetryInput) {
    const telemetry = Telemetry.create(input);
    await this.messageBus.publishTelemetry(telemetry);
    // Fire-and-forget DB save
    return { success: true, telemetry };
  }
}
```

### KafkaMessageBus
Kafka producer with connection management.

```typescript
await messageBus.connect();
await messageBus.publishTelemetry(telemetry);
await messageBus.disconnect();
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| HOST | Server host | 0.0.0.0 |
| PORT | Server port | 3000 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | PostgreSQL database | logistream |
| DB_USER | PostgreSQL user | postgres |
| DB_PASSWORD | PostgreSQL password | postgres |
| MONGO_URI | MongoDB connection string | mongodb://admin:admin123@localhost:27017/telemetry?authSource=admin |
| KAFKA_BROKERS | Kafka broker addresses | localhost:29092 |
| KAFKA_CLIENT_ID | Kafka client identifier | logistream-telemetry |
| JWT_SECRET | JWT signing secret | (change in production) |
| JWT_REFRESH_SECRET | JWT refresh token secret | (change in production) |

## 🔒 Security Considerations

- **Authentication**: JWT-based authentication for user endpoints
- **Authorization**: Role-based access control (RBAC)
- **Validation**: Input validation at presentation layer
- **Domain Validation**: Business rules enforced in domain layer
- **Environment Variables**: Sensitive data in environment variables
- **CORS**: Configurable CORS policy

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start production server**
   ```bash
   npm start
   ```

4. **Scale horizontally**
   - Multiple API instances behind load balancer
   - Kafka consumers scaled independently
   - Database connection pooling

5. **Monitor**
   - Application logs
   - Kafka lag monitoring
   - Database performance
   - API metrics

## 📚 Additional Resources

- [Fastify Documentation](https://www.fastify.io/)
- [Inversify Documentation](https://inversify.io/)
- [KafkaJS Documentation](https://kafka.js.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Clean Architecture principles by Robert C. Martin
- Fire-and-Forget pattern for high-throughput systems
- Modern TypeScript best practices
- Fastify team for excellent framework
- Inversify team for DI container

---

**Built with ❤️ for high-performance telemetry ingestion**
