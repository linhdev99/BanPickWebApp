// GameState.js - Model quản lý state của game
import { useState, useCallback, useEffect } from 'react';
import GameController from '../controllers/GameController';
import socketService from '../services/socketService';

export const useGameState = config => {
  const [phase, setPhase] = useState('ban');
  const [currentRound, setCurrentRound] = useState(1);
  const [bannedItems, setBannedItems] = useState([]);
  const [pickedItems, setPickedItems] = useState([]);

  const handleBanComplete = useCallback(
    newBans => {
      const updatedBannedItems = GameController.updateBannedItems(bannedItems, newBans);
      setBannedItems(updatedBannedItems);

      const nextState = GameController.getNextPhase(phase, currentRound, config);
      setPhase(nextState.phase);
      setCurrentRound(nextState.round);
    },
    [bannedItems, phase, currentRound, config]
  );

  const handlePickComplete = useCallback(
    newPicks => {
      const updatedPickedItems = GameController.updatePickedItems(pickedItems, newPicks);
      setPickedItems(updatedPickedItems);

      const nextState = GameController.getNextPhase(phase, currentRound, config);
      setPhase(nextState.phase);
      setCurrentRound(nextState.round);
    },
    [pickedItems, phase, currentRound, config]
  );

  const resetGame = useCallback(() => {
    const initialState = GameController.getInitialState();
    setPhase(initialState.phase);
    setCurrentRound(initialState.currentRound);
    setBannedItems(initialState.bannedItems);
    setPickedItems(initialState.pickedItems);
  }, []);

  return {
    // State
    phase,
    currentRound,
    bannedItems,
    pickedItems,
    // Actions
    handleBanComplete,
    handlePickComplete,
    resetGame,
  };
};

export const useMultiplayerGameState = () => {
  const [gameState, setGameState] = useState({
    phase: 'lobby', // 'lobby', 'waiting', 'ban', 'pick', 'complete'
    currentRound: 1,
    bannedItems: [],
    pickedItems: [],
    currentTeam: 'Blue',
    banCount: { Blue: 0, Red: 0 },
    pickProgress: { stepIndex: 0, teamCount: 0 },
  });

  const [roomData, setRoomData] = useState({
    roomId: '',
    players: [],
    yourTeam: '',
    config: null,
  });

  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isInRoom: false,
    error: null,
  });

  useEffect(() => {
    const handleGameStateUpdate = data => {
      console.log('handleGameStateUpdate received:', data);
      setGameState(data.gameState);
      setRoomData(prev => ({
        roomId: data.roomInfo?.roomId || prev.roomId,
        players: data.players || prev.players,
        yourTeam: data.yourTeam || prev.yourTeam,
        config: data.config || prev.config,
      }));
    };

    const handleJoinedRoom = data => {
      console.log('handleJoinedRoom received:', data);
      setConnectionState(prev => ({
        ...prev,
        isInRoom: true,
        error: null,
      }));
      setRoomData(prev => ({
        ...prev,
        roomId: data.roomId,
        yourTeam: data.team,
      }));
      setGameState(prev => ({
        ...prev,
        phase: 'waiting',
      }));
    };

    const handleError = error => {
      setConnectionState(prev => ({
        ...prev,
        error: error.message,
      }));
    };

    const handleActionSuccess = data => {
      console.log(`${data.action} successful:`, data.item, 'by', data.player);
    };

    const handleActionFailed = data => {
      setConnectionState(prev => ({
        ...prev,
        error: data.message,
      }));
    };

    const handleGameReset = () => {
      setConnectionState(prev => ({
        ...prev,
        error: null,
      }));
    };

    const handleConnected = () => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        error: null,
      }));
    };

    const handleDisconnected = () => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isInRoom: false,
        error: 'Disconnected from server',
      }));
      setGameState(prev => ({
        ...prev,
        phase: 'lobby',
      }));
    };

    socketService.on('gameStateUpdate', handleGameStateUpdate);
    socketService.on('joinedRoom', handleJoinedRoom);
    socketService.on('error', handleError);
    socketService.on('actionSuccess', handleActionSuccess);
    socketService.on('actionFailed', handleActionFailed);
    socketService.on('gameReset', handleGameReset);
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);

    return () => {
      socketService.off('gameStateUpdate', handleGameStateUpdate);
      socketService.off('joinedRoom', handleJoinedRoom);
      socketService.off('error', handleError);
      socketService.off('actionSuccess', handleActionSuccess);
      socketService.off('actionFailed', handleActionFailed);
      socketService.off('gameReset', handleGameReset);
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
    };
  }, [roomData.roomId]);

  const joinRoom = useCallback((roomId, playerName, team) => {
    socketService.joinRoom(roomId, playerName, team);
  }, []);

  const banItem = useCallback(
    item => {
      console.log('banItem called:', {
        item,
        gamePhase: gameState.phase,
        yourTeam: roomData.yourTeam,
        currentTeam: gameState.currentTeam,
        roomId: roomData.roomId,
      });

      if (gameState.phase === 'ban' && roomData.yourTeam === gameState.currentTeam) {
        console.log('Sending banItem to server');
        socketService.banItem(roomData.roomId, item);
      } else {
        console.log('banItem conditions not met');
      }
    },
    [gameState.phase, gameState.currentTeam, roomData.yourTeam, roomData.roomId]
  );

  const pickItem = useCallback(
    item => {
      if (gameState.phase === 'pick') {
        const round = roomData.config?.pickRounds[gameState.currentRound];
        if (round && round[gameState.pickProgress.stepIndex]) {
          const currentStep = round[gameState.pickProgress.stepIndex];
          if (currentStep.team === roomData.yourTeam) {
            socketService.pickItem(roomData.roomId, item);
          }
        }
      }
    },
    [
      gameState.phase,
      gameState.currentRound,
      gameState.pickProgress.stepIndex,
      roomData.yourTeam,
      roomData.roomId,
      roomData.config,
    ]
  );

  const resetGame = useCallback(() => {
    socketService.resetGame(roomData.roomId);
  }, [roomData.roomId]);

  const leaveRoom = useCallback(() => {
    socketService.disconnect();
    setGameState({
      phase: 'lobby',
      currentRound: 1,
      bannedItems: [],
      pickedItems: [],
      currentTeam: 'Blue',
      banCount: { Blue: 0, Red: 0 },
      pickProgress: { stepIndex: 0, teamCount: 0 },
    });
    setRoomData({
      roomId: '',
      players: [],
      yourTeam: '',
      config: null,
    });
    setConnectionState({
      isConnected: false,
      isInRoom: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setConnectionState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // State
    gameState,
    roomData,
    connectionState,
    // Actions
    joinRoom,
    banItem,
    pickItem,
    resetGame,
    leaveRoom,
    clearError,
  };
};
