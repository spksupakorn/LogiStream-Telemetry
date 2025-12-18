import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Container } from 'inversify';
import { createContainer } from '../infrastructure/di/container.js';

const diPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const container = createContainer(fastify.db, fastify.config);
  
  fastify.decorate('diContainer', container);
  fastify.log.info('✅ DI Container initialized');
}, {
  name: 'di',
  dependencies: ['config', 'db']
});

declare module 'fastify' {
  interface FastifyInstance {
    diContainer: Container;
  }
}

export default diPlugin;
