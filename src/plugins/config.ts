import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import { Type } from '@sinclair/typebox';

const schema = Type.Object({
  // Server
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.String({ default: 'development' }),
  
  // Database
  DB_HOST: Type.String({ default: 'localhost' }),
  DB_PORT: Type.Number({ default: 5432 }),
  DB_USERNAME: Type.String({ default: 'postgres' }),
  DB_PASSWORD: Type.String({ default: 'postgres' }),
  DB_DATABASE: Type.String({ default: 'logistream' }),
  DB_SSL: Type.Boolean({ default: false }),
  
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
});

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
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      CORS_ORIGIN: string;
    };
  }
}