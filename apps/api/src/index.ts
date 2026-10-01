import { createApp } from './app.js';
import { env } from './config/env.js';
import { createContainer } from './container.js';
import { logger } from './lib/logger.js';

const container = createContainer();
const app = createApp(container);

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
