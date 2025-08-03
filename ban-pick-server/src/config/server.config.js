/**
 * Server Configuration
 * Centralized configuration for the Ban-Pick server
 */

const fs = require('fs');
const path = require('path');

// Load configuration from JSON file
const configPath = path.join(__dirname, 'config.json');
let configData = {};

try {
  const configFileData = fs.readFileSync(configPath, 'utf8');
  configData = JSON.parse(configFileData);
} catch (error) {
  console.error('Error loading configuration:', error);
  throw new Error('Failed to load configuration. Please ensure config.json exists and is valid.');
}

const config = {
  // Server settings
  PORT: process.env.PORT || configData.server.port,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Client settings
  CLIENT_URL: process.env.CLIENT_URL || configData.server.clientUrl,

  // Game settings
  GAME_CONFIG: {
    MAX_PLAYERS_PER_ROOM: configData.game.maxPlayersPerRoom,
    MAX_ROOM_IDLE_TIME: configData.game.maxRoomIdleTime,
    ROOM_ID_LENGTH: configData.game.roomIdLength,
    PLAYER_NAME_MAX_LENGTH: configData.game.playerNameMaxLength,

    // Game configuration from JSON file
    banRounds: configData.banRounds,
    pickRounds: configData.pickRounds,
    gameItems: configData.gameItems,
  },

  // Socket.IO settings
  SOCKET_CONFIG: {
    pingTimeout: configData.socket.pingTimeout,
    pingInterval: configData.socket.pingInterval,
    maxHttpBufferSize: configData.socket.maxHttpBufferSize,
  },

  // Logging settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
