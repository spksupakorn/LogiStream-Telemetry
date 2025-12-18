import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

// Plugins
import configPlugin from './plugins/config.js';
import databasePlugin from './plugins/database.js';
import diPlugin from './plugins/di.js';
import corsPlugin from './plugins/cors.js';
import swaggerPlugin from './plugins/swagger.js';
import mongoosePlugin from './plugins/mongoose.js';
import kafkaPlugin from './plugins/kafka.js';

// Routes
import authRoutes from './presentation/routes/auth.routes.js';
import userRoutes from './presentation/routes/user.routes.js';
import telemetryRoutes from './presentation/routes/telemetry.routes.js';

// Error Handler
import { ErrorHandler } from './shared/errors/ErrorHandler.js';

export async function buildApp(): Promise<FastifyInstance> {
  // Initialize with basic logger first
  const fastify = Fastify({
    logger: true,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId'
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Register config plugin first to load environment variables
  await fastify.register(configPlugin);

  // Now configure logger based on loaded config
  const isDev = fastify.config.NODE_ENV !== 'production';
  
  // Update logger with proper configuration
  if (isDev) {
    const pino = await import('pino');
    fastify.log = pino.default({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true,
          singleLine: false
        }
      },
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            headers: request.headers,
            hostname: request.hostname,
            remoteAddress: request.ip,
            remotePort: request.socket?.remotePort
          };
        },
        res(reply) {
          return {
            statusCode: reply.statusCode
          };
        }
      }
    });
  }
  await fastify.register(corsPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(databasePlugin);
  await fastify.register(diPlugin);
  await fastify.register(mongoosePlugin);
  await fastify.register(kafkaPlugin);

  // Register error handler
  fastify.setErrorHandler(ErrorHandler.handle);

  // Health check route
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // Register API routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });
  await fastify.register(telemetryRoutes, { prefix: '/api/v1/telemetry' });

  return fastify;
}