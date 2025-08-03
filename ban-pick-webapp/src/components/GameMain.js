// GameMain.js - Component chính chứa logic render của game phases
import React from 'react';
import BanPhase from './BanPhase';
import PickPhase from './PickPhase';
import GameResults from './GameResults';
import { GAME_PHASES, CSS_CLASSES, UI_MESSAGES } from '../utils/constants';

const GameMain = ({
  phase,
  currentRound,
  bannedItems,
  pickedItems,
  config,
  onBanComplete,
  onPickComplete,
  onReset,
}) => {
  const renderPhase = () => {
    switch (phase) {
      case GAME_PHASES.BAN:
        return (
          <BanPhase
            banRounds={{
              [currentRound]: config.banRounds[currentRound],
            }}
            currentRound={currentRound}
            bannedItems={bannedItems}
            pickedItems={pickedItems}
            onComplete={onBanComplete}
          />
        );

      case GAME_PHASES.PICK:
        return (
          <PickPhase
            pickRounds={{
              [currentRound]: config.pickRounds[currentRound],
            }}
            currentRound={currentRound}
            bannedItems={bannedItems}
            pickedItems={pickedItems}
            onComplete={onPickComplete}
          />
        );

      case GAME_PHASES.COMPLETE:
        return (
          <GameResults bannedItems={bannedItems} pickedItems={pickedItems} onReset={onReset} />
        );

      default:
        return (
          <div>
            {UI_MESSAGES.UNKNOWN_PHASE}: {phase}
          </div>
        );
    }
  };

  return <main className={CSS_CLASSES.APP_MAIN}>{renderPhase()}</main>;
};

export default GameMain;
