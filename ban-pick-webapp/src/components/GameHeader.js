// GameHeader.js - Component hiển thị header của game
import React from 'react';
import { CSS_CLASSES } from '../utils/constants';
import { formatPhaseTitle } from '../utils/gameUtils';

const GameHeader = ({ currentRound, phase }) => {
  return (
    <header className={CSS_CLASSES.APP_HEADER}>
      <h1>Ban-Pick WebApp</h1>
      <div className={CSS_CLASSES.PHASE_INDICATOR}>
        Round {currentRound} - {formatPhaseTitle(phase)} Phase
      </div>
    </header>
  );
};

export default GameHeader;
