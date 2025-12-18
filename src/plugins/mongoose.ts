import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import mongoose from 'mongoose';

const mongoosePlugin: FastifyPluginAsync = fp(async (fastify) => {
    try {
    const mongoUri = fastify.config.MONGO_URI;
    
    fastify.log.info('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    fastify.log.info('MongoDB connected successfully');

    // Decorate fastify with mongoose   
    fastify.decorate('mongoose', mongoose);

    // Graceful shutdown
    fastify.addHook('onClose', async (instance) => {
      instance.log.info('Closing MongoDB connection...');
      await mongoose.connection.close();
      instance.log.info('MongoDB connection closed');
    });

    // Handle MongoDB connection errors
    mongoose.connection.on('error', (error: any) => {
      fastify.log.error({ error }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      fastify.log.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      fastify.log.info('MongoDB reconnected');
    });

  } catch (error) {
    fastify.log.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
}, {
  name: 'mongoose',
  dependencies: ['config']
});

declare module 'fastify' {
  interface FastifyInstance {
    mongoose: typeof mongoose;
  }
}

export default mongoosePlugin;

// async function mongoosePlugin(
//   fastify: FastifyInstance,
//   opts: FastifyPluginOptions
// ): Promise<void> {
//   try {
//     const mongoUri = fastify.config.MONGO_URI;
    
//     fastify.log.info('Connecting to MongoDB...');
    
//     await mongoose.connect(mongoUri, {
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//     });

//     fastify.log.info('MongoDB connected successfully');

//     // Decorate fastify with mongoose
//     fastify.decorate('mongoose', mongoose);

//     // Graceful shutdown
//     fastify.addHook('onClose', async (instance) => {
//       instance.log.info('Closing MongoDB connection...');
//       await mongoose.connection.close();
//       instance.log.info('MongoDB connection closed');
//     });

//     // Handle MongoDB connection errors
//     mongoose.connection.on('error', (error: any) => {
//       fastify.log.error({ error }, 'MongoDB connection error');
//     });

//     mongoose.connection.on('disconnected', () => {
//       fastify.log.warn('MongoDB disconnected');
//     });

//     mongoose.connection.on('reconnected', () => {
//       fastify.log.info('MongoDB reconnected');
//     });

//   } catch (error) {
//     fastify.log.error({ error }, 'Failed to connect to MongoDB');
//     throw error;
//   }
// }

// export default fp(mongoosePlugin, {
//   name: 'mongoose',
//   dependencies: ['config']
// });
