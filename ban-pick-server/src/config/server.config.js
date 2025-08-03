/**
 * Server Configuration
 * Centralized configuration for the Ban-Pick server
 */

const config = {
  // Server settings
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Client settings
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Game settings
  GAME_CONFIG: {
    MAX_PLAYERS_PER_ROOM: 2,
    MAX_ROOM_IDLE_TIME: 30 * 60 * 1000, // 30 minutes
    ROOM_ID_LENGTH: 6,
    PLAYER_NAME_MAX_LENGTH: 20,

    // Ban-Pick configuration
    BAN_ROUNDS: {
      1: { firstTeam: 'Blue', countPerTeam: 3 },
      2: { firstTeam: 'Red', countPerTeam: 2 },
    },

    PICK_ROUNDS: {
      1: [
        { team: 'Blue', count: 1 },
        { team: 'Red', count: 2 },
        { team: 'Blue', count: 2 },
        { team: 'Red', count: 1 },
      ],
      2: [
        { team: 'Red', count: 1 },
        { team: 'Blue', count: 2 },
        { team: 'Red', count: 1 },
      ],
    },
  },

  // Socket.IO settings
  SOCKET_CONFIG: {
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
  },

  // Logging settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
