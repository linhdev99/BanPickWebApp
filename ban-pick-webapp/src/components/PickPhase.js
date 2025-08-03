import React from 'react';
import { TEAMS, GAME_ITEMS } from '../utils/constants'; // eslint-disable-line no-unused-vars

const PickPhase = ({
  // Multiplayer props
  gameState,
  roomData,
  onPickItem,
  // Single player props (fallback)
  pickRounds,
  currentRound = 1,
  bannedItems = [],
  pickedItems: globalPickedItems = [],
  onComplete,
}) => {
  // Use multiplayer state if available, otherwise fallback to single player
  const isMultiplayer = gameState && roomData;

  console.log('PickPhase render:', {
    isMultiplayer,
    gameState,
    roomData,
    onPickItem: !!onPickItem,
    config: roomData?.config,
    pickRounds: roomData?.config?.pickRounds,
    currentRound: gameState?.currentRound,
    pickProgress: gameState?.pickProgress,
  });

  const bannedItemsToUse = isMultiplayer ? gameState.bannedItems : bannedItems;
  const pickedItems = isMultiplayer ? gameState.pickedItems : globalPickedItems;
  const config = isMultiplayer ? roomData.config : { pickRounds };
  const currentRoundToUse = isMultiplayer ? gameState.currentRound : currentRound;
  const yourTeam = isMultiplayer ? roomData.yourTeam : null;
  const pickProgress = isMultiplayer ? gameState.pickProgress : { stepIndex: 0, teamCount: 0 };

  // Show loading state if multiplayer config is not yet available
  if (isMultiplayer && !roomData?.config) {
    return (
      <div className='pick-phase'>
        <div className='loading-state'>
          <p>Loading game configuration...</p>
        </div>
      </div>
    );
  }

  const getCurrentStep = () => {
    if (!config?.pickRounds?.[currentRoundToUse]) return null;
    return config.pickRounds[currentRoundToUse][pickProgress.stepIndex];
  };

  const currentStep = getCurrentStep();

  // For multiplayer, use gameState.currentTeam; for single player, use currentStep.team
  const currentTeam = isMultiplayer ? gameState.currentTeam : currentStep?.team;
  const isYourTurn = isMultiplayer ? yourTeam === currentTeam : true;

  const handlePick = item => {
    console.log('Attempting to pick item:', item, {
      isMultiplayer,
      isYourTurn,
      hasOnPickItem: !!onPickItem,
      currentStep,
      currentTeam,
      yourTeam,
      gameStateCurrentTeam: gameState?.currentTeam,
    });

    if (isMultiplayer) {
      // Multiplayer: Use socket action
      if (onPickItem && isYourTurn) {
        console.log('Calling onPickItem for:', item);
        onPickItem(item);
      } else {
        console.log('Cannot pick - not your turn or no onPickItem function');
      }
    } else {
      // Single player: Keep original logic for backwards compatibility
      if (!currentStep || !onComplete) return;

      const newPickedItems = [
        ...pickedItems,
        {
          item,
          team: currentStep.team,
          round: currentRound,
          step: pickProgress.stepIndex + 1,
        },
      ];

      const newTeamCount = pickProgress.teamCount + 1;

      // Check if current step is complete
      if (newTeamCount >= currentStep.count) {
        const nextStepIndex = pickProgress.stepIndex + 1;
        if (nextStepIndex < pickRounds[currentRound].length) {
          // Move to next step
        } else {
          // Complete pick round
          onComplete(newPickedItems);
        }
      }
    }
  };

  const gameItems = GAME_ITEMS;

  if (!config?.pickRounds?.[currentRoundToUse] || !currentStep) {
    return (
      <div className='pick-phase'>
        <p>No pick configuration found for round {currentRoundToUse}</p>
        <p>Available rounds: {Object.keys(config?.pickRounds || {}).join(', ')}</p>
        <p>Current step data: {currentStep ? 'Available' : 'Missing'}</p>
      </div>
    );
  }

  const roundSteps = config.pickRounds[currentRoundToUse];
  const remainingPicks = currentStep.count - pickProgress.teamCount;

  return (
    <div className='pick-phase'>
      <h2>Pick Phase - Round {currentRoundToUse}</h2>

      {/* Multiplayer info */}
      {isMultiplayer && (
        <div className='multiplayer-info'>
          <div className='room-info'>
            <p>
              <strong>Room:</strong> {roomData.roomId}
            </p>
            <p>
              <strong>Your Team:</strong> {yourTeam}
            </p>
            <p>
              <strong>Players:</strong>{' '}
              {roomData.players?.map(p => `${p.name} (${p.team})`).join(', ')}
            </p>
          </div>
          {!isYourTurn && (
            <div className='waiting-message'>
              <p>🕐 Waiting for {currentTeam} team to pick...</p>
            </div>
          )}
          {isYourTurn && (
            <div className='your-turn-message'>
              <p>⚡ Your turn to pick!</p>
            </div>
          )}
        </div>
      )}

      <div className='current-turn'>
        <h3>
          Current Turn: {currentTeam} Team{' '}
          {isMultiplayer && yourTeam === currentTeam ? '(You)' : ''}
        </h3>
        <p>Remaining picks: {remainingPicks}</p>
        <p>
          Step {pickProgress.stepIndex + 1} of {roundSteps.length}
        </p>
      </div>

      <div className='round-overview'>
        <h4>Round {currentRoundToUse} Schedule:</h4>
        <ol>
          {roundSteps.map((step, index) => (
            <li
              key={index}
              className={`${
                index === pickProgress.stepIndex
                  ? 'current'
                  : index < pickProgress.stepIndex
                    ? 'completed'
                    : ''
              } ${isMultiplayer && yourTeam === step.team ? 'your-team-step' : ''}`}
            >
              {step.team} Team: {step.count} pick(s){' '}
              {isMultiplayer && yourTeam === step.team ? '(Your turn)' : ''}
            </li>
          ))}
        </ol>
      </div>

      <div className='items-grid'>
        {gameItems.map((item, index) => {
          const isBanned = bannedItemsToUse.some(ban => ban.item === item);
          const isPicked = pickedItems.some(pick => pick.item === item);
          const isAvailable = !isBanned && !isPicked;
          const isDisabled = !isAvailable || (isMultiplayer && !isYourTurn);

          // Find which team picked this item
          const pickedBy = pickedItems.find(pick => pick.item === item);

          return (
            <button
              key={index}
              className={`item ${
                isBanned
                  ? 'banned'
                  : isPicked
                    ? `picked ${pickedBy ? pickedBy.team.toLowerCase() : ''}`
                    : ''
              } ${isMultiplayer && !isYourTurn ? 'not-your-turn' : ''}`}
              onClick={() => isAvailable && !isDisabled && handlePick(item)}
              disabled={isDisabled}
              title={isMultiplayer && !isYourTurn ? 'Not your turn' : ''}
            >
              {item}
              {isBanned && <span className='status-label banned-label'>BANNED</span>}
              {isPicked && pickedBy && (
                <span className={`status-label picked-label ${pickedBy.team.toLowerCase()}`}>
                  PICKED BY {pickedBy.team.toUpperCase()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className='picked-items'>
        <h3>Picked Items This Round:</h3>
        <div className='team-picks'>
          <div className='blue-picks'>
            <h4>Blue Team {isMultiplayer && yourTeam === 'Blue' ? '(You)' : ''}:</h4>
            {pickedItems.filter(pick => pick.team === 'Blue' && pick.round === currentRoundToUse)
              .length === 0 ? (
              <p>No picks yet</p>
            ) : (
              <ul>
                {pickedItems
                  .filter(pick => pick.team === 'Blue' && pick.round === currentRoundToUse)
                  .map((pick, index) => (
                    <li key={index}>
                      {pick.item} (Step {pick.step || 'N/A'})
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className='red-picks'>
            <h4>Red Team {isMultiplayer && yourTeam === 'Red' ? '(You)' : ''}:</h4>
            {pickedItems.filter(pick => pick.team === 'Red' && pick.round === currentRoundToUse)
              .length === 0 ? (
              <p>No picks yet</p>
            ) : (
              <ul>
                {pickedItems
                  .filter(pick => pick.team === 'Red' && pick.round === currentRoundToUse)
                  .map((pick, index) => (
                    <li key={index}>
                      {pick.item} (Step {pick.step || 'N/A'})
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickPhase;
