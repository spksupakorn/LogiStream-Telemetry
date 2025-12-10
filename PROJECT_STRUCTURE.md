# Project Structure Overview

Complete file structure of the LogiStream Telemetry API project.

```
LogiStream-Telemetry/
│
├── src/
│   ├── domain/                          # Domain Layer (Business Logic)
│   │   ├── entities/
│   │   │   ├── User.entity.ts          # User entity with TypeORM decorators
│   │   │   ├── Role.entity.ts          # Role entity
│   │   │   └── Permission.entity.ts    # Permission entity
│   │   └── repositories/               # Repository interfaces (ports)
│   │       ├── IUserRepository.ts
│   │       ├── IRoleRepository.ts
│   │       └── IPermissionRepository.ts
│   │
│   ├── application/                     # Application Layer (Use Cases)
│   │   ├── use-cases/
│   │   │   ├── CreateUserUseCase.ts    # Create user business logic
│   │   │   ├── GetUserUseCase.ts       # Get single user
│   │   │   ├── GetAllUsersUseCase.ts   # Get paginated users
│   │   │   ├── UpdateUserUseCase.ts    # Update user
│   │   │   ├── DeleteUserUseCase.ts    # Delete user
│   │   │   └── LoginUseCase.ts         # Authentication logic
│   │   └── dtos/
│   │       └── UserDto.ts              # DTOs with class-validator decorators
│   │
│   ├── infrastructure/                  # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── datasource.ts           # TypeORM DataSource configuration
│   │   │   └── seed.ts                 # Database seeding script
│   │   ├── repositories/               # Repository implementations
│   │   │   ├── UserRepository.ts
│   │   │   ├── RoleRepository.ts
│   │   │   └── PermissionRepository.ts
│   │   └── di/                         # Dependency Injection
│   │       ├── types.ts                # DI type symbols
│   │       └── container.ts            # InversifyJS container configuration
│   │
│   ├── presentation/                    # Presentation Layer (API)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # Auth endpoints (login, register)
│   │   │   └── user.routes.ts          # User CRUD endpoints
│   │   └── middlewares/
│   │       ├── authenticate.ts         # JWT authentication middleware
│   │       └── authorize.ts            # RBAC authorization middleware
│   │
│   ├── shared/                          # Shared utilities
│   │   ├── errors/
│   │   │   ├── AppError.ts             # Base error class
│   │   │   ├── index.ts                # Specific error classes
│   │   │   └── ErrorHandler.ts         # Global error handler
│   │   └── utils/
│   │       ├── ResponseBuilder.ts      # Standardized API responses
│   │       └── DtoValidator.ts         # DTO validation utility
│   │
│   ├── plugins/                         # Fastify plugins
│   │   ├── config.ts                   # Environment configuration
│   │   ├── database.ts                 # Database connection plugin
│   │   ├── di.ts                       # DI container plugin
│   │   └── cors.ts                     # CORS configuration
│   │
│   ├── routes/                          # Old routes (to be removed)
│   │   └── users/
│   │       ├── index.ts                # Marked for deletion
│   │       └── schema.ts               # Marked for deletion
│   │
│   ├── app.ts                           # Application setup
│   ├── server.ts                        # Entry point
│   └── seed.ts                          # Seed script runner
│
├── dist/                                # Compiled JavaScript (gitignored)
├── node_modules/                        # Dependencies (gitignored)
│
├── .env                                 # Environment variables (gitignored)
├── .env.example                         # Environment template
├── .gitignore                           # Git ignore rules
├── Dockerfile                           # Docker configuration
├── package.json                         # Project dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── README.md                            # Main documentation
├── API_TESTING.md                       # API testing guide with curl examples
├── postman_collection.json              # Postman collection
└── PROJECT_STRUCTURE.md                 # This file
```

## Key Files Description

### Core Application Files

- **`src/app.ts`** - Fastify application setup with plugins and routes
- **`src/server.ts`** - Entry point that starts the server
- **`src/seed.ts`** - Database seeding script runner

### Domain Layer (Business Entities)

- **User.entity.ts** - User entity with roles relationship
- **Role.entity.ts** - Role entity with users and permissions
- **Permission.entity.ts** - Permission entity defining actions
- **I*Repository.ts** - Repository interfaces (dependency inversion)

### Application Layer (Business Logic)

- **CreateUserUseCase.ts** - Handles user creation with validation
- **LoginUseCase.ts** - Handles authentication and token generation
- **UserDto.ts** - Request/Response DTOs with validation decorators

### Infrastructure Layer

- **datasource.ts** - TypeORM DataSource factory
- **UserRepository.ts** - User repository implementation
- **container.ts** - InversifyJS DI container bindings
- **types.ts** - Dependency injection symbols

### Presentation Layer (API)

- **auth.routes.ts** - Public authentication endpoints
- **user.routes.ts** - Protected user management endpoints
- **authenticate.ts** - JWT token validation middleware
- **authorize.ts** - Role and permission checking middleware

### Shared Utilities

- **AppError.ts** - Base error class for custom errors
- **ErrorHandler.ts** - Centralized error handling
- **ResponseBuilder.ts** - Standardized API response format
- **DtoValidator.ts** - Request validation utility

### Configuration

- **config.ts** - Environment variable loading and validation
- **database.ts** - Database connection lifecycle management
- **di.ts** - DI container integration with Fastify
- **cors.ts** - CORS policy configuration

## Architecture Flow

```
HTTP Request
    ↓
Fastify Server (server.ts)
    ↓
Routes (presentation/routes)
    ↓
Middlewares (authenticate, authorize)
    ↓
Route Handler
    ↓
DTO Validation (DtoValidator)
    ↓
Use Case (application/use-cases)
    ↓
Repository (infrastructure/repositories)
    ↓
TypeORM Entity (domain/entities)
    ↓
Database
    ↓
Response Builder
    ↓
JSON Response
```

## Dependency Injection Flow

```
Server Start
    ↓
Initialize Database (DataSource)
    ↓
Create DI Container (InversifyJS)
    ↓
Bind DataSource
    ↓
Bind Repositories (with DataSource)
    ↓
Bind Use Cases (with Repositories)
    ↓
Container Ready
    ↓
Routes Resolve Dependencies
    ↓
Execute Business Logic
```

## Clean Architecture Boundaries

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Routes, Middlewares, HTTP Handling)   │
└──────────────┬──────────────────────────┘
               │ Uses
┌──────────────▼──────────────────────────┐
│         Application Layer               │
│     (Use Cases, Business Logic)         │
└──────────────┬──────────────────────────┘
               │ Uses
┌──────────────▼──────────────────────────┐
│           Domain Layer                  │
│   (Entities, Repository Interfaces)     │
└──────────────▲──────────────────────────┘
               │ Implements
┌──────────────┴──────────────────────────┐
│       Infrastructure Layer              │
│  (TypeORM, Repositories, DI, Database)  │
└─────────────────────────────────────────┘
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 5.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL 13+
- **DI Container**: InversifyJS 7.x
- **Validation**: class-validator
- **Authentication**: JWT (jsonwebtoken)
- **Logger**: Pino (via Fastify)
- **Dev Tools**: tsx, pino-pretty

## Scripts

- `npm run dev` - Development with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Production server
- `npm run seed` - Seed database
- `npm run lint` - Run linter

## Environment Variables

See `.env.example` for all available configuration options.

## Next Steps

1. Remove old route files in `src/routes/users/`
2. Add migration scripts for production
3. Add unit and integration tests
4. Add API documentation (Swagger/OpenAPI)
5. Add rate limiting
6. Add caching layer (Redis)
7. Add monitoring and observability
