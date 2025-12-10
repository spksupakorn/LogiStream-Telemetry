import { buildApp } from './app.js';

const start = async () => {
  const server = await buildApp();
  
  try {
    await server.listen({ port: server.config.PORT, host: '0.0.0.0' });
    server.log.info(`Server listening on http://localhost:${server.config.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown handler
  let isShuttingDown = false;
  server.log.info('Graceful shutdown handlers registered');
  
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) {
      server.log.warn('Shutdown already in progress...');
      return;
    }
    
    isShuttingDown = true;
    server.log.info(`Received ${signal}, starting graceful shutdown...`);
    
    // Set timeout for graceful shutdown
    const shutdownTimeout = setTimeout(() => {
      server.log.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 10000); // 10 seconds timeout

    try {
      await server.close();
      clearTimeout(shutdownTimeout);
      server.log.info('✅ Server closed successfully');
      
      // Flush logs to stdout/stderr before exiting
      await new Promise((resolve) => {
        process.stdout.write('', () => {
          process.stderr.write('', () => {
            resolve(undefined);
          });
        });
      });
      
      process.exit(0);
    } catch (err) {
      clearTimeout(shutdownTimeout);
      server.log.error(err, '❌ Error during shutdown');
      
      // Flush logs before exiting with error
      await new Promise((resolve) => {
        process.stdout.write('', () => {
          process.stderr.write('', () => {
            resolve(undefined);
          });
        });
      });
      
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (err) => {
    server.log.error(err, '❌ Uncaught exception');
    void gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    server.log.error({ reason, promise }, '❌ Unhandled promise rejection');
    void gracefulShutdown('unhandledRejection');
  });
};

start();