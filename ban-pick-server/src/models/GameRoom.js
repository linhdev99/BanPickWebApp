/**
 * GameRoom Model
 * Represents a game room with players and game state
 */

const config = require('../config/server.config');
const logger = require('../utils/logger');

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = [];
    this.createdAt = new Date();
    this.lastActivity = new Date();

    this.gameState = {
      phase: 'waiting', // 'waiting', 'ban', 'pick', 'complete'
      currentRound: 1,
      bannedItems: [],
      pickedItems: [],
      currentTeam: 'Blue',
      banCount: { Blue: 0, Red: 0 },
      pickProgress: { stepIndex: 0, teamCount: 0 },
    };

    this.config = config.GAME_CONFIG;

    logger.info(`Room ${roomId} created`);
  }

  // Player management
  addPlayer(socket, playerName, team) {
    if (this.players.length >= this.config.MAX_PLAYERS_PER_ROOM) {
      throw new Error('Room is full');
    }

    if (this.isTeamTaken(team)) {
      throw new Error(`Team ${team} is already taken`);
    }

    if (this.isPlayerNameTaken(playerName)) {
      throw new Error(`Player name ${playerName} is already taken`);
    }

    const player = {
      id: socket.id,
      name: playerName,
      team: team,
      socket: socket,
      joinedAt: new Date(),
    };

    this.players.push(player);
    this.updateActivity();

    logger.info(`Player ${playerName} joined room ${this.roomId} as ${team} team`);

    // Start game if room is full
    if (this.players.length === this.config.MAX_PLAYERS_PER_ROOM) {
      this.startGame();
    }

    return player;
  }

  removePlayer(socketId) {
    const playerIndex = this.players.findIndex((p) => p.id === socketId);

    if (playerIndex !== -1) {
      const player = this.players[playerIndex];
      this.players.splice(playerIndex, 1);
      this.updateActivity();

      logger.info(`Player ${player.name} left room ${this.roomId}`);

      // Reset game if a player leaves during gameplay
      if (
        this.gameState.phase !== 'waiting' &&
        this.players.length < this.config.MAX_PLAYERS_PER_ROOM
      ) {
        this.resetToWaiting();
      }
    }

    return this.players.length === 0; // Return true if room should be deleted
  }

  // Helper methods
  isTeamTaken(team) {
    return this.players.some((p) => p.team === team);
  }

  isPlayerNameTaken(playerName) {
    return this.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase());
  }

  getPlayer(socketId) {
    return this.players.find((p) => p.id === socketId);
  }

  updateActivity() {
    this.lastActivity = new Date();
  }

  isIdle() {
    const idleTime = Date.now() - this.lastActivity.getTime();
    return idleTime > this.config.MAX_ROOM_IDLE_TIME;
  }

  // Game logic
  startGame() {
    this.gameState.phase = 'ban';
    this.gameState.currentTeam = this.config.BAN_ROUNDS['1'].firstTeam;
    this.updateActivity();

    logger.info(`Game started in room ${this.roomId}`);
    this.broadcastGameState();
  }

  resetToWaiting() {
    this.gameState = {
      phase: 'waiting',
      currentRound: 1,
      bannedItems: [],
      pickedItems: [],
      currentTeam: 'Blue',
      banCount: { Blue: 0, Red: 0 },
      pickProgress: { stepIndex: 0, teamCount: 0 },
    };

    logger.info(`Game reset to waiting in room ${this.roomId}`);
    this.broadcastGameState();
  }

  handleBan(socketId, item) {
    const player = this.getPlayer(socketId);
    if (!player || this.gameState.phase !== 'ban') {
      return { success: false, message: 'Invalid ban attempt' };
    }

    if (player.team !== this.gameState.currentTeam) {
      return { success: false, message: 'Not your turn' };
    }

    const round = this.config.BAN_ROUNDS[this.gameState.currentRound];
    if (!round) {
      return { success: false, message: 'Invalid round' };
    }

    // Check if item is already banned or picked
    if (this.isItemBanned(item) || this.isItemPicked(item)) {
      return { success: false, message: 'Item already banned or picked' };
    }

    // Add ban
    this.gameState.bannedItems.push({
      item,
      team: player.team,
      round: this.gameState.currentRound,
      player: player.name,
      timestamp: new Date(),
    });

    this.gameState.banCount[player.team]++;
    this.updateActivity();

    // Update phase
    this.updateBanPhase(round);
    this.broadcastGameState();

    logger.debug(`${player.name} banned ${item} in room ${this.roomId}`);
    return { success: true, message: 'Ban successful' };
  }

  handlePick(socketId, item) {
    const player = this.getPlayer(socketId);
    if (!player || this.gameState.phase !== 'pick') {
      return { success: false, message: 'Invalid pick attempt' };
    }

    const round = this.config.PICK_ROUNDS[this.gameState.currentRound];
    if (!round) {
      return { success: false, message: 'Invalid round' };
    }

    const currentStep = round[this.gameState.pickProgress.stepIndex];
    if (!currentStep || player.team !== currentStep.team) {
      return { success: false, message: 'Not your turn' };
    }

    // Check if item is banned or already picked
    if (this.isItemBanned(item) || this.isItemPicked(item)) {
      return { success: false, message: 'Item already banned or picked' };
    }

    // Add pick
    this.gameState.pickedItems.push({
      item,
      team: player.team,
      round: this.gameState.currentRound,
      step: this.gameState.pickProgress.stepIndex + 1,
      player: player.name,
      timestamp: new Date(),
    });

    this.gameState.pickProgress.teamCount++;
    this.updateActivity();

    // Update phase
    this.updatePickPhase(round);
    this.broadcastGameState();

    logger.debug(`${player.name} picked ${item} in room ${this.roomId}`);
    return { success: true, message: 'Pick successful' };
  }

  isItemBanned(item) {
    return this.gameState.bannedItems.some((ban) => ban.item === item);
  }

  isItemPicked(item) {
    return this.gameState.pickedItems.some((pick) => pick.item === item);
  }

  updateBanPhase(round) {
    // Check if current team finished their bans
    if (this.gameState.banCount[this.gameState.currentTeam] < round.countPerTeam) {
      // Switch to other team if they haven't finished
      const otherTeam = this.gameState.currentTeam === 'Blue' ? 'Red' : 'Blue';
      if (this.gameState.banCount[otherTeam] < round.countPerTeam) {
        this.gameState.currentTeam = otherTeam;
      }
    } else {
      // Current team finished, switch to other if they haven't finished
      const otherTeam = this.gameState.currentTeam === 'Blue' ? 'Red' : 'Blue';
      if (this.gameState.banCount[otherTeam] < round.countPerTeam) {
        this.gameState.currentTeam = otherTeam;
      }
    }

    // Check if ban round is complete
    if (
      this.gameState.banCount.Blue >= round.countPerTeam &&
      this.gameState.banCount.Red >= round.countPerTeam
    ) {
      this.proceedToNextPhase();
    }
  }

  updatePickPhase(round) {
    const currentStep = round[this.gameState.pickProgress.stepIndex];

    if (this.gameState.pickProgress.teamCount >= currentStep.count) {
      // Move to next step
      this.gameState.pickProgress.stepIndex++;
      this.gameState.pickProgress.teamCount = 0;

      if (this.gameState.pickProgress.stepIndex >= round.length) {
        // Pick round complete
        this.proceedToNextPhase();
      } else {
        // Update current team for the new step
        const nextStep = round[this.gameState.pickProgress.stepIndex];
        this.gameState.currentTeam = nextStep.team;

        logger.debug(
          `Pick step complete, moving to step ${this.gameState.pickProgress.stepIndex}, team: ${this.gameState.currentTeam}`
        );
      }
    }
  }

  proceedToNextPhase() {
    if (this.gameState.phase === 'ban') {
      // Check if there's a pick round for current round
      if (this.config.PICK_ROUNDS[this.gameState.currentRound]) {
        this.gameState.phase = 'pick';
        this.gameState.pickProgress = { stepIndex: 0, teamCount: 0 };

        // Set current team to the first team in pick sequence
        const firstPickStep = this.config.PICK_ROUNDS[this.gameState.currentRound][0];
        this.gameState.currentTeam = firstPickStep.team;

        logger.debug(`Proceeding to pick phase, first team: ${this.gameState.currentTeam}`);
      } else {
        this.moveToNextRound();
      }
    } else if (this.gameState.phase === 'pick') {
      this.moveToNextRound();
    }
  }

  moveToNextRound() {
    const nextRound = this.gameState.currentRound + 1;
    if (this.config.BAN_ROUNDS[nextRound]) {
      this.gameState.currentRound = nextRound;
      this.gameState.phase = 'ban';
      this.gameState.currentTeam = this.config.BAN_ROUNDS[nextRound].firstTeam;
      this.gameState.banCount = { Blue: 0, Red: 0 };
    } else {
      this.gameState.phase = 'complete';
      logger.info(`Game completed in room ${this.roomId}`);
    }
  }

  resetGame() {
    this.gameState = {
      phase: 'ban',
      currentRound: 1,
      bannedItems: [],
      pickedItems: [],
      currentTeam: this.config.BAN_ROUNDS['1'].firstTeam,
      banCount: { Blue: 0, Red: 0 },
      pickProgress: { stepIndex: 0, teamCount: 0 },
    };

    this.updateActivity();
    logger.info(`Game reset in room ${this.roomId}`);
    this.broadcastGameState();
  }

  broadcastGameState() {
    // Prepare config in client-friendly format
    const clientConfig = {
      banRounds: this.config.BAN_ROUNDS,
      pickRounds: this.config.PICK_ROUNDS,
    };

    this.players.forEach((player) => {
      player.socket.emit('gameStateUpdate', {
        gameState: this.gameState,
        config: clientConfig,
        players: this.players.map((p) => ({
          name: p.name,
          team: p.team,
          id: p.id,
        })),
        yourTeam: player.team,
        roomInfo: {
          roomId: this.roomId,
          playersCount: this.players.length,
          maxPlayers: this.config.MAX_PLAYERS_PER_ROOM,
        },
      });
    });
  }

  // Get room status for monitoring
  getStatus() {
    return {
      roomId: this.roomId,
      playersCount: this.players.length,
      phase: this.gameState.phase,
      currentRound: this.gameState.currentRound,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      isIdle: this.isIdle(),
    };
  }
}

module.exports = GameRoom;
