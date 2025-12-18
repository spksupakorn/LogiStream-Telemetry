import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { createDataSource } from '../infrastructure/database/datasource.js';
import { DataSource } from 'typeorm';

const databasePlugin: FastifyPluginAsync = fp(async (fastify) => {
  const dataSource = createDataSource(fastify.config);

  try {
    await dataSource.initialize();
    fastify.log.info('✅ Database connected successfully');
    
    // Make dataSource available on fastify instance
    fastify.decorate('db', dataSource);

    // Close connection when app closes
    fastify.addHook('onClose', async () => {
      await dataSource.destroy();
      fastify.log.info('Database connection closed');
    });
  } catch (error) {
    fastify.log.error({ err: error }, '❌ Database connection failed');
    throw error;
  }
},{
  name: 'db',
  dependencies: ['config']
});

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
  }
}

export default databasePlugin;
