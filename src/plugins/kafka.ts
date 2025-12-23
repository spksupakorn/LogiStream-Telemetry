import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { IMessageBus } from '../domain/services/IMessageBus.js';
import { TYPES } from '../infrastructure/di/types.js';

const kafkaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  try {
    const messageBus = fastify.diContainer.get<IMessageBus>(TYPES.IMessageBus);
    
    fastify.log.info('Connecting to Kafka...');
    
    await messageBus.connect();

    fastify.log.info('Kafka connected successfully');

    // Decorate fastify with kafka
    fastify.decorate('kafka', messageBus);

    // Graceful shutdown
    fastify.addHook('onClose', async (instance) => {
      instance.log.info('Closing Kafka connection...');
      await messageBus.disconnect();
      instance.log.info('Kafka connection closed');
    });

  } catch (error) {
    fastify.log.error({ error }, 'Failed to connect to Kafka');
    throw error;
  }
}, {
  name: 'kafka',
  dependencies: ['di', 'config']
});

declare module 'fastify' {
  interface FastifyInstance {
    kafka: IMessageBus;
  }
}

export default kafkaPlugin;

// async function kafkaPlugin(
//   fastify: FastifyInstance,
//   opts: FastifyPluginOptions
// ): Promise<void> {
//   try {
//     const messageBus = fastify.diContainer.get<IMessageBus>(TYPES.IMessageBus);
    
//     fastify.log.info('Connecting to Kafka...');
    
//     await messageBus.connect();

//     fastify.log.info('Kafka connected successfully');

//     // Decorate fastify with kafka
//     fastify.decorate('kafka', messageBus);

//     // Graceful shutdown
//     fastify.addHook('onClose', async (instance) => {
//       instance.log.info('Closing Kafka connection...');
//       await messageBus.disconnect();
//       instance.log.info('Kafka connection closed');
//     });

//   } catch (error) {
//     fastify.log.error({ error }, 'Failed to connect to Kafka');
//     throw error;
//   }
// }

// export default fp(kafkaPlugin, {
//   name: 'kafka',
//   dependencies: ['di', 'config']
// });
