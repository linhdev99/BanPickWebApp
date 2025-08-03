/**
 * Socket Controller
 * Handles all socket.io events and interactions
 */

const roomManager = require('../services/roomManager');
const logger = require('../utils/logger');
const config = require('../config/server.config');

class SocketController {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    this.setupSocketEvents();
    logger.info('Socket controller initialized');
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id} from ${socket.handshake.address}`);

      // Send connection confirmation
      socket.emit('connected', {
        id: socket.id,
        timestamp: new Date().toISOString(),
      });

      // Join room event
      socket.on('joinRoom', (data) => {
        this.handleJoinRoom(socket, data);
      });

      // Ban item event
      socket.on('banItem', (data) => {
        this.handleBanItem(socket, data);
      });

      // Pick item event
      socket.on('pickItem', (data) => {
        this.handlePickItem(socket, data);
      });

      // Reset game event
      socket.on('resetGame', (data) => {
        this.handleResetGame(socket, data);
      });

      // Get room info event
      socket.on('getRoomInfo', (data) => {
        this.handleGetRoomInfo(socket, data);
      });

      // Leave room event
      socket.on('leaveRoom', (data) => {
        this.handleLeaveRoom(socket, data);
      });

      // Ping-pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Disconnect event
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // Connection error handling
      socket.on('connect_error', (error) => {
        logger.error(`Connection error for ${socket.id}:`, {
          error: error.message,
          type: error.type,
        });
      });

      // General error handling
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, {
          error: error.message || error,
          stack: error.stack,
        });
      });
    });
  }

  handleJoinRoom(socket, data) {
    try {
      const { roomId, playerName, team } = data;

      // Validate input
      if (!roomId || !playerName || !team) {
        socket.emit('error', {
          message: 'Missing required fields: roomId, playerName, team',
        });
        return;
      }

      // Validate room ID format
      if (roomId.length !== config.GAME_CONFIG.ROOM_ID_LENGTH) {
        socket.emit('error', {
          message: `Room ID must be ${config.GAME_CONFIG.ROOM_ID_LENGTH} characters long`,
        });
        return;
      }

      // Validate player name
      if (playerName.length > config.GAME_CONFIG.PLAYER_NAME_MAX_LENGTH) {
        socket.emit('error', {
          message: `Player name must be ${config.GAME_CONFIG.PLAYER_NAME_MAX_LENGTH} characters or less`,
        });
        return;
      }

      // Validate team
      if (!['Blue', 'Red'].includes(team)) {
        socket.emit('error', {
          message: 'Team must be either Blue or Red',
        });
        return;
      }

      // Get or create room
      let room = roomManager.getRoom(roomId);
      if (!room) {
        room = roomManager.createRoom(roomId);
      }

      // Add player to room
      const player = room.addPlayer(socket, playerName.trim(), team);

      // Join socket room
      socket.join(roomId);

      // Store room info in socket
      socket.roomId = roomId;
      socket.playerName = playerName;
      socket.team = team;

      // Send success response
      socket.emit('joinedRoom', {
        roomId,
        team,
        playerName,
        message: `Joined as ${team} team`,
        roomInfo: {
          playersCount: room.players.length,
          maxPlayers: config.GAME_CONFIG.MAX_PLAYERS_PER_ROOM,
        },
      });

      // Broadcast updated game state
      room.broadcastGameState();

      logger.info(`Player ${playerName} joined room ${roomId} as ${team} team`);
    } catch (error) {
      logger.error(`Error joining room for ${socket.id}:`, { error: error.message });
      socket.emit('error', { message: error.message });
    }
  }

  handleBanItem(socket, data) {
    try {
      const { roomId, item } = data;

      if (!roomId || !item) {
        socket.emit('actionFailed', {
          action: 'ban',
          message: 'Missing roomId or item',
        });
        return;
      }

      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('actionFailed', {
          action: 'ban',
          message: 'Room not found',
        });
        return;
      }

      const result = room.handleBan(socket.id, item);

      if (result.success) {
        const player = room.getPlayer(socket.id);
        this.io.to(roomId).emit('actionSuccess', {
          action: 'ban',
          item,
          player: player.name,
          team: player.team,
        });

        logger.debug(`Ban successful: ${item} by ${player.name} in room ${roomId}`);
      } else {
        socket.emit('actionFailed', {
          action: 'ban',
          message: result.message,
        });
      }
    } catch (error) {
      logger.error(`Error banning item for ${socket.id}:`, { error: error.message });
      socket.emit('actionFailed', {
        action: 'ban',
        message: 'Internal server error',
      });
    }
  }

  handlePickItem(socket, data) {
    try {
      const { roomId, item } = data;

      if (!roomId || !item) {
        socket.emit('actionFailed', {
          action: 'pick',
          message: 'Missing roomId or item',
        });
        return;
      }

      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('actionFailed', {
          action: 'pick',
          message: 'Room not found',
        });
        return;
      }

      const result = room.handlePick(socket.id, item);

      if (result.success) {
        const player = room.getPlayer(socket.id);
        this.io.to(roomId).emit('actionSuccess', {
          action: 'pick',
          item,
          player: player.name,
          team: player.team,
        });

        logger.debug(`Pick successful: ${item} by ${player.name} in room ${roomId}`);
      } else {
        socket.emit('actionFailed', {
          action: 'pick',
          message: result.message,
        });
      }
    } catch (error) {
      logger.error(`Error picking item for ${socket.id}:`, { error: error.message });
      socket.emit('actionFailed', {
        action: 'pick',
        message: 'Internal server error',
      });
    }
  }

  handleResetGame(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) {
        socket.emit('error', { message: 'Missing roomId' });
        return;
      }

      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Check if player is in the room
      const player = room.getPlayer(socket.id);
      if (!player) {
        socket.emit('error', { message: 'You are not in this room' });
        return;
      }

      room.resetGame();

      this.io.to(roomId).emit('gameReset', {
        message: `Game reset by ${player.name}`,
        resetBy: player.name,
      });

      logger.info(`Game reset in room ${roomId} by ${player.name}`);
    } catch (error) {
      logger.error(`Error resetting game for ${socket.id}:`, { error: error.message });
      socket.emit('error', { message: 'Failed to reset game' });
    }
  }

  handleGetRoomInfo(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) {
        socket.emit('error', { message: 'Missing roomId' });
        return;
      }

      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('roomInfo', { exists: false });
        return;
      }

      socket.emit('roomInfo', {
        exists: true,
        roomId: room.roomId,
        playersCount: room.players.length,
        maxPlayers: config.GAME_CONFIG.MAX_PLAYERS_PER_ROOM,
        phase: room.gameState.phase,
        players: room.players.map((p) => ({
          name: p.name,
          team: p.team,
        })),
      });
    } catch (error) {
      logger.error(`Error getting room info for ${socket.id}:`, { error: error.message });
      socket.emit('error', { message: 'Failed to get room info' });
    }
  }

  handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data || {};
      const targetRoomId = roomId || socket.roomId;

      if (!targetRoomId) {
        return; // Nothing to leave
      }

      const room = roomManager.getRoom(targetRoomId);
      if (room) {
        const player = room.getPlayer(socket.id);
        const shouldDelete = room.removePlayer(socket.id);

        if (shouldDelete) {
          roomManager.deleteRoom(targetRoomId);
        } else {
          room.broadcastGameState();
        }

        socket.leave(targetRoomId);

        if (player) {
          logger.info(`Player ${player.name} left room ${targetRoomId}`);
        }
      }

      // Clear socket room info
      delete socket.roomId;
      delete socket.playerName;
      delete socket.team;
    } catch (error) {
      logger.error(`Error leaving room for ${socket.id}:`, { error: error.message });
    }
  }

  handleDisconnect(socket, reason) {
    logger.info(`Client disconnected: ${socket.id} (reason: ${reason})`);

    // Log additional disconnect info
    if (socket.roomId) {
      logger.info(`Disconnected player was in room: ${socket.roomId}`);
    }

    // Handle player disconnection across all rooms
    roomManager.handlePlayerDisconnection(socket.id);
  }

  // Admin/monitoring methods
  broadcastServerMessage(message) {
    this.io.emit('serverMessage', {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  getRoomStatistics() {
    return roomManager.getStatistics();
  }

  getRoomsInfo() {
    return roomManager.getRoomsInfo();
  }
}

// Export singleton instance
module.exports = new SocketController();
