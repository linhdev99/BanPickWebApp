/**
 * Ban-Pick Server Application
 * Main application file
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const config = require('./config/server.config');
const socketController = require('./controllers/socketController');
const logger = require('./utils/logger');

class BanPickServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: [config.CLIENT_URL, 'http://localhost:3000'],
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: config.SOCKET_CONFIG.pingTimeout,
      pingInterval: config.SOCKET_CONFIG.pingInterval,
      maxHttpBufferSize: config.SOCKET_CONFIG.maxHttpBufferSize,
      allowEIO3: true, // Allow Engine.IO v3 clients
      connectTimeout: 45000,
      upgradeTimeout: 30000,
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
  }

  setupMiddleware() {
    // Enable CORS
    this.app.use(
      cors({
        origin: [config.CLIENT_URL, 'http://localhost:3000'],
        credentials: true,
        optionsSuccessStatus: 200, // For legacy browser support
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Parse JSON bodies
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // API info endpoint
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: 'Ban-Pick Server',
        version: '1.0.0',
        description: 'Real-time multiplayer ban-pick game server',
        endpoints: {
          health: '/health',
          info: '/api/info',
        },
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
      });
    });
  }

  setupSocket() {
    // Initialize socket controller
    socketController.initialize(this.io);

    logger.info('Socket.IO server initialized');
  }

  start() {
    const PORT = config.PORT;

    this.server.listen(PORT, () => {
      logger.info(`🚀 Ban-Pick server running on port ${PORT}`);
      logger.info(`📡 Client URL: ${config.CLIENT_URL}`);
      logger.info(`🔧 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  }
}

module.exports = BanPickServer;
