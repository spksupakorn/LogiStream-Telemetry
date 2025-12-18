# Telemetry Architecture Documentation

## System Overview

LogiStream Telemetry Service is designed for high-throughput IoT data ingestion using the Fire-and-Forget pattern. This architecture enables the system to handle thousands of events per second while maintaining low latency and high reliability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         IoT Devices                              │
│              (Refrigerated Trucks with Sensors)                  │
└──────────────┬──────────────────────────────────┬────────────────┘
               │                                  │
               │ HTTP POST                        │ HTTP POST (Batch)
               │                                  │
┌──────────────▼──────────────────────────────────▼────────────────┐
│                     API Layer (Fastify)                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Controllers → Routes → Schemas (Validation)                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ Dependency Injection (Inversify)
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    Application Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         IngestTelemetryUseCase (Business Logic)              │ │
│  │  • Validate domain rules                                     │ │
│  │  • Create Telemetry entity                                   │ │
│  │  • Publish to Kafka (Fire)                                   │ │
│  │  • Persist to DB async (Forget)                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────────┬────────────────┘
               │                                  │
               │ Publish                          │ Save (Async)
               │                                  │
┌──────────────▼──────────────────┐  ┌───────────▼──────────────────┐
│      Kafka (Message Broker)     │  │    MongoDB (Persistence)      │
│  • Topic: telemetry-events      │  │  • Collection: telemetry      │
│  • Partitioned by deviceId      │  │  • Indexed by device/time     │
│  • High throughput               │  │  • Time-series optimized      │
└──────────────┬──────────────────┘  └───────────────────────────────┘
               │
               │ Consume
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    Consumer Services                             │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │ Alert Service  │  │ Analytics      │  │ Route Plotter     │  │
│  │ (Temperature)  │  │ Service        │  │ Service           │  │
│  └────────────────┘  └────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Ingestion Flow (Fire-and-Forget)

```
IoT Device → API → Validation → Domain Entity → Kafka → 202 Accepted
                                           ↓
                                    MongoDB (async)
```

**Timeline:**
1. **0ms**: Request received
2. **1ms**: Validation at presentation layer (TypeBox schemas)
3. **2ms**: Domain entity creation & validation
4. **5ms**: Kafka publish (fast, in-memory buffer)
5. **6ms**: 202 Accepted response sent to client ✅
6. **Later**: MongoDB persistence (fire-and-forget, doesn't block)

### 2. Processing Flow

```
Kafka Topic → Consumer Group → Process → Action
                                    ↓
                              - Send Alerts
                              - Update Analytics
                              - Plot Routes
                              - Store Warehouse
```

## Clean Architecture Layers

### 1. Domain Layer (Core Business Logic)

**Location:** `src/domain/`

**Responsibilities:**
- Business entities with validation
- Repository interfaces
- Service interfaces
- No external dependencies

**Example: Telemetry Entity**
```typescript
class Telemetry {
  static create(data: TelemetryData): Telemetry {
    this.validate(data);  // Business rules
    return new Telemetry(data);
  }
  
  needsAlert(): boolean {
    return this.isTemperatureAlert() || this.isHumidityAlert();
  }
}
```

### 2. Application Layer (Use Cases)

**Location:** `src/application/`

**Responsibilities:**
- Orchestrate business logic
- Use domain entities and repositories
- Define application-specific types
- No framework dependencies

**Example: IngestTelemetryUseCase**
```typescript
async execute(input: IngestTelemetryInput) {
  const telemetry = Telemetry.create(input);
  await this.messageBus.publishTelemetry(telemetry);  // Fire
  this.repository.save(telemetry).catch(...);         // Forget
  return { success: true, telemetry };
}
```

### 3. Infrastructure Layer (External Concerns)

**Location:** `src/infrastructure/`

**Responsibilities:**
- Database connections (TypeORM, Mongoose)
- Message bus implementation (KafkaJS)
- Repository implementations
- Configuration management
- Dependency injection container

**Example: KafkaMessageBus**
```typescript
async publishTelemetry(telemetry: Telemetry) {
  await this.producer.send({
    topic: 'telemetry-events',
    messages: [{ key: telemetry.deviceId, value: JSON.stringify(telemetry) }]
  });
}
```

### 4. Presentation Layer (API)

**Location:** `src/presentation/`

**Responsibilities:**
- HTTP controllers
- Route definitions
- Request/response schemas
- Middleware (auth, validation)

**Example: TelemetryController**
```typescript
async ingest(request: FastifyRequest, reply: FastifyReply) {
  const result = await this.useCase.execute(request.body);
  reply.code(202).send(ResponseBuilder.success(result));
}
```

## Design Patterns

### 1. Fire-and-Forget Pattern

**Purpose:** Achieve high throughput by not waiting for slow operations.

**Implementation:**
```typescript
// Fast: Publish to Kafka (in-memory buffer)
await this.messageBus.publishTelemetry(telemetry);

// Slow: Persist to database (fire-and-forget)
this.repository.save(telemetry).catch(error => {
  console.error('Failed to persist:', error);
  // Log but don't fail the request
});
```

**Benefits:**
- API response time: ~5-10ms
- High throughput: 1000+ requests/second
- Resilient: Kafka ensures message delivery

### 2. Repository Pattern

**Purpose:** Abstract data access and enable testability.

**Implementation:**
```typescript
// Interface (domain layer)
interface ITelemetryRepository {
  save(telemetry: Telemetry): Promise<Telemetry>;
}

// Implementation (infrastructure layer)
class TelemetryRepository implements ITelemetryRepository {
  async save(telemetry: Telemetry) {
    const doc = new TelemetryModel(telemetry);
    return await doc.save();
  }
}

// Usage (application layer)
class IngestTelemetryUseCase {
  constructor(@inject(TYPES.ITelemetryRepository) private repo) {}
}
```

### 3. Dependency Injection

**Purpose:** Loose coupling and testability.

**Implementation:**
```typescript
// Container configuration
container.bind<ITelemetryRepository>(TYPES.ITelemetryRepository)
  .to(TelemetryRepository)
  .inSingletonScope();

// Constructor injection
@injectable()
class IngestTelemetryUseCase {
  constructor(
    @inject(TYPES.ITelemetryRepository) private repository,
    @inject(TYPES.IMessageBus) private messageBus
  ) {}
}
```

### 4. Use Case Pattern

**Purpose:** Encapsulate business logic in single-responsibility classes.

**Benefits:**
- Easy to test in isolation
- Clear business intent
- Reusable across different interfaces (HTTP, CLI, gRPC)

## Kafka Integration

### Topic Configuration

**Topic Name:** `telemetry-events`

**Partitioning Strategy:**
- Partition key: `deviceId`
- Ensures ordering per device
- Enables parallel processing

**Message Format:**
```json
{
  "key": "device-001",
  "value": {
    "deviceId": "device-001",
    "truckId": "truck-001",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "temperature": -5,
    "humidity": 45,
    "timestamp": "2025-12-18T10:00:00Z"
  },
  "headers": {
    "event-type": "telemetry-ingested",
    "device-id": "device-001",
    "truck-id": "truck-001",
    "needs-alert": "false"
  }
}
```

### Producer Configuration

```typescript
{
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
}
```

### Consumer Considerations

Consumers should:
1. Subscribe to `telemetry-events` topic
2. Process messages in parallel (multiple partitions)
3. Handle idempotency (Kafka at-least-once delivery)
4. Commit offsets after processing

## MongoDB Schema

### Collection: `telemetry`

**Indexes:**
```javascript
// Compound indexes for efficient queries
{ deviceId: 1, timestamp: -1 }
{ truckId: 1, timestamp: -1 }
{ timestamp: -1 }
```

**Schema:**
```typescript
{
  deviceId: String,     // Indexed
  truckId: String,      // Indexed
  latitude: Number,     // -90 to 90
  longitude: Number,    // -180 to 180
  temperature: Number,  // -40 to 40
  humidity: Number,     // 0 to 100
  speed?: Number,       // 0 to 200
  altitude?: Number,    // -500 to 9000
  timestamp: Date,      // Indexed
  createdAt: Date,      // Auto
  updatedAt: Date       // Auto
}
```

## Scalability Considerations

### Horizontal Scaling

**API Instances:**
- Stateless design
- Scale behind load balancer
- Each instance connects to Kafka

**Kafka:**
- Multiple partitions per topic
- Consumer groups for parallel processing
- Auto-rebalancing

**MongoDB:**
- Replica sets for read scaling
- Sharding for write scaling
- Time-series collections (MongoDB 5.0+)

### Performance Optimizations

1. **Batch Ingestion**: Up to 1000 events per request
2. **Kafka Batching**: Producer batches messages automatically
3. **MongoDB Bulk Writes**: Batch database operations
4. **Connection Pooling**: Reuse connections
5. **Async Processing**: Fire-and-forget pattern

### Capacity Planning

**Target:** 10,000 telemetry events per second

**Infrastructure:**
- 5 API instances (2000 req/s each)
- 10 Kafka partitions
- 10 consumer instances
- MongoDB replica set (3 nodes)

## Testing Strategy

### Unit Tests
- Domain entities (validation logic)
- Use cases (business logic)
- Mocked dependencies

### Integration Tests
- API endpoints
- Repository implementations
- Kafka integration

### Load Tests
- Batch ingestion performance
- Concurrent requests
- Kafka throughput

## Monitoring & Observability

### Key Metrics

**API:**
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)

**Kafka:**
- Message throughput
- Consumer lag
- Partition distribution

**MongoDB:**
- Write operations/s
- Query performance
- Storage size

### Logging

**Structured logs:**
```json
{
  "level": "info",
  "msg": "Telemetry published",
  "deviceId": "device-001",
  "timestamp": "2025-12-18T10:00:00Z",
  "needs_alert": false
}
```

## Security

### Authentication
- JWT-based authentication
- Token refresh mechanism

### Authorization
- Role-based access control (RBAC)
- Permission system

### Validation
- Presentation layer: TypeBox schemas
- Domain layer: Business rules
- Double validation prevents bad data

### Data Protection
- Environment variables for secrets
- No sensitive data in logs
- HTTPS in production

## Future Enhancements

1. **Real-time Dashboard**: WebSocket for live telemetry visualization
2. **Historical Analytics**: Time-series aggregations
3. **Predictive Maintenance**: ML models for failure prediction
4. **Geofencing**: Alert when trucks leave designated areas
5. **Route Optimization**: Real-time route adjustments
6. **Multi-region**: Deploy across multiple regions for global coverage

## Conclusion

This architecture demonstrates:
- ✅ Clean Architecture principles
- ✅ Fire-and-Forget pattern for high throughput
- ✅ Event-driven design with Kafka
- ✅ Testable and maintainable code
- ✅ Production-ready scalability

The system can handle thousands of telemetry events per second while maintaining low latency and high reliability.
