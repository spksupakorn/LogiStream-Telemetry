import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import { Type } from '@sinclair/typebox';

const schema = Type.Object({
  // Server
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.String({ default: 'development' }),
  
  // PostgreSQL Database (User authentication)
  DB_HOST: Type.String({ default: 'localhost' }),
  DB_PORT: Type.Number({ default: 5432 }),
  DB_USERNAME: Type.String({ default: 'postgres' }),
  DB_PASSWORD: Type.String({ default: 'postgres' }),
  DB_DATABASE: Type.String({ default: 'logistream' }),
  DB_SSL: Type.Boolean({ default: false }),
  
  // MongoDB (Telemetry data)
  MONGO_URI: Type.String({ 
    default: 'mongodb://admin:admin123@localhost:27017/telemetry?authSource=admin' 
  }),
  
  // Kafka (Message broker)
  KAFKA_BROKERS: Type.String({ default: 'localhost:29092' }),
  KAFKA_CLIENT_ID: Type.String({ default: 'logistream-telemetry' }),
  
  // JWT
  JWT_SECRET: Type.String({ default: 'your-secret-key-change-in-production' }),
  JWT_REFRESH_SECRET: Type.String({ default: 'your-refresh-secret-change-in-production' }),
  
  // CORS
  CORS_ORIGIN: Type.String({ default: '*' })
});

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true // Load .env file automatically
  });
}, {
  name: 'config'
}
);

// Extend FastifyInstance to include config
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      NODE_ENV: string;
      DB_HOST: string;
      DB_PORT: number;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_DATABASE: string;
      DB_SSL: boolean;
      MONGO_URI: string;
      KAFKA_BROKERS: string;
      KAFKA_CLIENT_ID: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      CORS_ORIGIN: string;
    };
  }
}