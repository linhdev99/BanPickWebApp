/**
 * Room Manager Service
 * Manages all game rooms and their lifecycle
 */

const GameRoom = require('../models/GameRoom');
const logger = require('../utils/logger');
const config = require('../config/server.config');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.setupCleanupInterval();
  }

  createRoom(roomId) {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId);
    }

    const room = new GameRoom(roomId);
    this.rooms.set(roomId, room);

    logger.info(`Room ${roomId} created. Total rooms: ${this.rooms.size}`);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
      logger.info(`Room ${roomId} deleted. Total rooms: ${this.rooms.size}`);
      return true;
    }
    return false;
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  getRoomCount() {
    return this.rooms.size;
  }

  // Generate a unique room ID
  generateRoomId() {
    let roomId;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      roomId = Math.random()
        .toString(36)
        .substring(2, 2 + config.GAME_CONFIG.ROOM_ID_LENGTH)
        .toUpperCase();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique room ID');
      }
    } while (this.rooms.has(roomId));

    return roomId;
  }

  // Clean up idle rooms
  cleanupIdleRooms() {
    const idleRooms = [];

    for (const [roomId, room] of this.rooms) {
      if (room.isIdle()) {
        idleRooms.push(roomId);
      }
    }

    idleRooms.forEach((roomId) => {
      const room = this.rooms.get(roomId);
      logger.info(`Cleaning up idle room ${roomId} (last activity: ${room.lastActivity})`);

      // Notify players before cleanup
      room.players.forEach((player) => {
        player.socket.emit('roomClosed', {
          reason: 'Room was idle for too long',
          roomId: roomId,
        });
      });

      this.deleteRoom(roomId);
    });

    if (idleRooms.length > 0) {
      logger.info(`Cleaned up ${idleRooms.length} idle rooms`);
    }
  }

  setupCleanupInterval() {
    // Clean up idle rooms every 5 minutes
    setInterval(() => {
      this.cleanupIdleRooms();
    }, 5 * 60 * 1000);

    logger.info('Room cleanup interval setup complete');
  }

  // Get statistics about all rooms
  getStatistics() {
    const rooms = this.getAllRooms();
    const stats = {
      totalRooms: rooms.length,
      activeRooms: 0,
      waitingRooms: 0,
      playingRooms: 0,
      completedRooms: 0,
      totalPlayers: 0,
      averagePlayersPerRoom: 0,
    };

    rooms.forEach((room) => {
      stats.totalPlayers += room.players.length;

      switch (room.gameState.phase) {
        case 'waiting':
          stats.waitingRooms++;
          break;
        case 'ban':
        case 'pick':
          stats.playingRooms++;
          stats.activeRooms++;
          break;
        case 'complete':
          stats.completedRooms++;
          break;
      }
    });

    if (stats.totalRooms > 0) {
      stats.averagePlayersPerRoom = Math.round((stats.totalPlayers / stats.totalRooms) * 100) / 100;
    }

    return stats;
  }

  // Get detailed room information for monitoring
  getRoomsInfo() {
    return this.getAllRooms().map((room) => room.getStatus());
  }

  // Handle player disconnection across all rooms
  handlePlayerDisconnection(socketId) {
    for (const [roomId, room] of this.rooms) {
      const shouldDelete = room.removePlayer(socketId);

      if (shouldDelete) {
        this.deleteRoom(roomId);
      } else if (room.players.length > 0) {
        // Notify remaining players
        room.broadcastGameState();
      }
    }
  }
}

// Export singleton instance
module.exports = new RoomManager();
