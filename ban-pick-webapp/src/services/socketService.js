// socketService.js - Service quản lý kết nối Socket.IO
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  connect(serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000') {
    if (this.socket && this.socket.connected) {
      console.log('Already connected, reusing connection');
      return this.socket;
    }

    if (this.socket) {
      this.disconnect();
    }

    console.log('Connecting to server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      forceNew: false, // Reuse existing connection if possible
      multiplex: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.emit('connected', { id: this.socket.id });
    });

    this.socket.on('disconnect', reason => {
      console.log('Disconnected from server, reason:', reason);
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', error => {
      console.error('Connection error:', error);
      this.emit('error', { message: 'Connection failed', error });
    });

    this.socket.on('reconnect', attemptNumber => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      this.emit('connected', { id: this.socket.id, reconnected: true });
    });

    this.socket.on('reconnecting', attemptNumber => {
      console.log('Reconnecting to server, attempt:', attemptNumber);
    });

    this.socket.on('reconnect_error', error => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
      this.emit('error', { message: 'Failed to reconnect to server' });
    });

    this.socket.on('error', error => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    this.socket.on('joinedRoom', data => {
      this.emit('joinedRoom', data);
    });

    this.socket.on('gameStateUpdate', data => {
      this.emit('gameStateUpdate', data);
    });

    this.socket.on('actionSuccess', data => {
      this.emit('actionSuccess', data);
    });

    this.socket.on('actionFailed', data => {
      this.emit('actionFailed', data);
    });

    this.socket.on('gameReset', () => {
      this.emit('gameReset');
    });

    // Handle server-side connected event
    this.socket.on('connected', data => {
      console.log('Server confirmed connection:', data);
    });

    // Handle ping-pong for connection health
    this.socket.on('ping', () => {
      this.socket.emit('pong');
    });
  }

  // Join a game room
  joinRoom(roomId, playerName, team) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId, playerName, team });
    }
  }

  // Ban an item
  banItem(roomId, item) {
    if (this.socket) {
      this.socket.emit('banItem', { roomId, item });
    }
  }

  // Pick an item
  pickItem(roomId, item) {
    if (this.socket) {
      this.socket.emit('pickItem', { roomId, item });
    }
  }

  // Reset game
  resetGame(roomId) {
    if (this.socket) {
      this.socket.emit('resetGame', { roomId });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Utility methods
  isConnected() {
    return this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
