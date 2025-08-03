// GameState.js - Model quản lý state của game
import { useState, useCallback } from 'react';
import GameController from '../controllers/GameController';

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
