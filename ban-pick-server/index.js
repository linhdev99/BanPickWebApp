/**
 * Ban-Pick Server Entry Point
 * Starts the Ban-Pick multiplayer server
 */

const BanPickServer = require('./src/app');
const logger = require('./src/utils/logger');

// Create and start server
const server = new BanPickServer();

try {
  server.start();
} catch (error) {
  logger.error('Failed to start server:', { error: error.message });
  process.exit(1);
}
