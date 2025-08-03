// GameMain.js - Component chính chứa logic render của game phases
import React from 'react';
import BanPhase from './BanPhase';
import PickPhase from './PickPhase';
import GameResults from './GameResults';
import { GAME_PHASES, CSS_CLASSES, UI_MESSAGES } from '../utils/constants';

const GameMain = ({
  // Single player mode props
  phase,
  currentRound,
  bannedItems,
  pickedItems,
  config,
  onBanComplete,
  onPickComplete,
  onReset,
  // Multiplayer mode props
  gameState,
  roomData,
  onBanItem,
  onPickItem,
}) => {
  // Check if this is multiplayer mode
  const isMultiplayer = gameState && roomData;

  // Get the appropriate config (multiplayer uses server config, single player uses local config)
  const gameConfig = isMultiplayer ? roomData?.config || config : config;

  const renderPhase = () => {
    const currentPhase = isMultiplayer ? gameState.phase : phase;
    const activeRound = isMultiplayer ? gameState.currentRound : currentRound;
    const activeBannedItems = isMultiplayer ? gameState.bannedItems : bannedItems;
    const activePickedItems = isMultiplayer ? gameState.pickedItems : pickedItems;

    // Return loading state if we don't have config yet
    if (!gameConfig) {
      return (
        <div className='loading-state'>
          <p>Loading game configuration...</p>
        </div>
      );
    }

    switch (currentPhase) {
      case GAME_PHASES.BAN:
        return (
          <BanPhase
            // Multiplayer props
            gameState={gameState}
            roomData={roomData}
            onBanItem={onBanItem}
            // Universal props
            banRounds={{
              [activeRound]: gameConfig.banRounds?.[activeRound],
            }}
            currentRound={activeRound}
            bannedItems={activeBannedItems}
            pickedItems={activePickedItems}
            onComplete={onBanComplete}
          />
        );

      case GAME_PHASES.PICK:
        return (
          <PickPhase
            // Multiplayer props
            gameState={gameState}
            roomData={roomData}
            onPickItem={onPickItem}
            // Universal props
            pickRounds={{
              [activeRound]: gameConfig.pickRounds?.[activeRound],
            }}
            currentRound={activeRound}
            bannedItems={activeBannedItems}
            pickedItems={activePickedItems}
            onComplete={onPickComplete}
          />
        );

      case GAME_PHASES.COMPLETE:
        return (
          <GameResults
            bannedItems={activeBannedItems}
            pickedItems={activePickedItems}
            onReset={onReset}
          />
        );

      default:
        return (
          <div>
            {UI_MESSAGES.UNKNOWN_PHASE}: {currentPhase}
          </div>
        );
    }
  };

  return <main className={CSS_CLASSES.APP_MAIN}>{renderPhase()}</main>;
};

export default GameMain;
