// BanPhase.js - Component cho giai đoạn ban items
import React from 'react';
import { TEAMS } from '../utils/constants';

const BanPhase = ({
  // Multiplayer props
  gameState,
  roomData,
  onBanItem,
  // Single player props (fallback)
  banRounds,
  currentRound = 1,
  bannedItems = [],
  pickedItems = [],
  onComplete,
}) => {
  // Check if this is multiplayer mode
  const isMultiplayer = gameState && roomData;

  // Get game items from config - required for game to work
  const gameItems = isMultiplayer ? roomData?.config?.gameItems : banRounds?.gameItems; // Single player should provide gameItems in config

  console.log('BanPhase render:', {
    isMultiplayer,
    gameState,
    roomData,
    onBanItem: !!onBanItem,
    config: roomData?.config,
    banRounds: roomData?.config?.banRounds,
    currentRound: gameState?.currentRound,
    roundData: isMultiplayer
      ? roomData?.config?.banRounds?.[gameState?.currentRound]
      : banRounds?.[currentRound],
  });

  // Get current round data
  const roundData = isMultiplayer
    ? roomData?.config?.banRounds?.[gameState.currentRound]
    : banRounds?.[currentRound];

  // Show loading state if multiplayer config is not yet available
  if (isMultiplayer && !roomData?.config) {
    return (
      <div className='ban-phase'>
        <div className='loading-state'>
          <p>Loading game configuration...</p>
        </div>
      </div>
    );
  }

  // Show error if no game items available
  if (!gameItems || gameItems.length === 0) {
    return (
      <div className='ban-phase'>
        <div className='error-state'>
          <p>❌ No game items available</p>
          <p>Game items must be provided in config</p>
        </div>
      </div>
    );
  }

  if (!roundData) {
    return (
      <div className='ban-phase'>
        <p>
          No ban configuration found for round{' '}
          {isMultiplayer ? gameState.currentRound : currentRound}
        </p>
        <p>
          Available rounds:{' '}
          {Object.keys(isMultiplayer ? roomData?.config?.banRounds || {} : banRounds || {}).join(
            ', '
          )}
        </p>
      </div>
    );
  }

  // Get current team info
  const currentTeam = isMultiplayer ? gameState.currentTeam : 'Blue'; // Default for single player
  const yourTeam = isMultiplayer ? roomData.yourTeam : null;
  const isYourTurn = isMultiplayer ? currentTeam === yourTeam : true;

  // Get ban counts
  const banCount = isMultiplayer ? gameState.banCount : { Blue: 0, Red: 0 };

  const handleItemBan = item => {
    console.log('Attempting to ban item:', item, {
      isMultiplayer,
      isYourTurn,
      hasOnBanItem: !!onBanItem,
      currentTeam,
      yourTeam,
    });

    if (isMultiplayer) {
      if (onBanItem && isYourTurn) {
        console.log('Calling onBanItem for:', item);
        onBanItem(item);
      } else {
        console.log('Cannot ban - not your turn or no onBanItem function');
      }
    } else {
      // Single player logic
      const newBan = {
        item,
        team: currentTeam,
        round: currentRound,
        player: 'Player',
      };

      console.log('Single player ban:', newBan);
      if (onComplete) {
        onComplete([newBan]);
      }
    }
  };

  const isItemBanned = item => {
    return bannedItems.some(ban => ban.item === item);
  };

  const isItemPicked = item => {
    return pickedItems.some(pick => pick.item === item);
  };

  const isItemDisabled = item => {
    return isItemBanned(item) || isItemPicked(item) || (isMultiplayer && !isYourTurn);
  };

  const getItemStatus = item => {
    if (isItemBanned(item)) {
      const ban = bannedItems.find(b => b.item === item);
      return { status: 'banned', team: ban?.team, player: ban?.player };
    }
    if (isItemPicked(item)) {
      const pick = pickedItems.find(p => p.item === item);
      return { status: 'picked', team: pick?.team, player: pick?.player };
    }
    return { status: 'available' };
  };

  return (
    <div className='ban-phase'>
      {/* Multiplayer Info */}
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
        </div>
      )}

      {/* Round Info */}
      <div className='round-info'>
        <h2>Round {isMultiplayer ? gameState.currentRound : currentRound} - Ban Phase</h2>
        <p>Each team bans {roundData.countPerTeam} items</p>
      </div>

      {/* Team Information */}
      <div className='team-info'>
        <div
          className={`team ${currentTeam === TEAMS.BLUE ? 'active' : ''} ${yourTeam === TEAMS.BLUE ? 'your-team' : ''}`}
        >
          <h3>Blue Team</h3>
          <p>
            Bans: {banCount.Blue} / {roundData.countPerTeam}
          </p>
        </div>
        <div
          className={`team ${currentTeam === TEAMS.RED ? 'active' : ''} ${yourTeam === TEAMS.RED ? 'your-team' : ''}`}
        >
          <h3>Red Team</h3>
          <p>
            Bans: {banCount.Red} / {roundData.countPerTeam}
          </p>
        </div>
      </div>

      {/* Current Turn Indicator */}
      <div className='current-turn'>
        {isMultiplayer ? (
          isYourTurn ? (
            <div className='your-turn-message'>
              <p>🎯 Your turn to ban! ({yourTeam} Team)</p>
            </div>
          ) : (
            <div className='waiting-message'>
              <p>⏳ Waiting for {currentTeam} team to ban...</p>
            </div>
          )
        ) : (
          <p>Current turn: {currentTeam} Team</p>
        )}
      </div>

      {/* Items Grid */}
      <div className='items-grid'>
        {gameItems.map(item => {
          const itemStatus = getItemStatus(item);
          const disabled = isItemDisabled(item);

          return (
            <button
              key={item}
              className={`item ${itemStatus.status} ${itemStatus.team ? itemStatus.team.toLowerCase() : ''} ${disabled ? 'not-your-turn' : ''}`}
              onClick={() => handleItemBan(item)}
              disabled={disabled}
              title={
                itemStatus.status === 'banned'
                  ? `Banned by ${itemStatus.player} (${itemStatus.team})`
                  : itemStatus.status === 'picked'
                    ? `Picked by ${itemStatus.player} (${itemStatus.team})`
                    : `Click to ban ${item}`
              }
            >
              {item}
              {itemStatus.status === 'banned' && (
                <span className={`status-label banned-label`}>BANNED</span>
              )}
              {itemStatus.status === 'picked' && (
                <span className={`status-label picked-label ${itemStatus.team?.toLowerCase()}`}>
                  PICKED
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Bans Display */}
      {bannedItems.length > 0 && (
        <div className='banned-items'>
          <h3>Banned Items</h3>
          <div className='team-results'>
            <div className='team-result'>
              <h4>Blue Team Bans</h4>
              <ul>
                {bannedItems
                  .filter(ban => ban.team === TEAMS.BLUE)
                  .map((ban, index) => (
                    <li key={index}>
                      {ban.item} {ban.player && `(by ${ban.player})`}
                    </li>
                  ))}
              </ul>
            </div>
            <div className='team-result'>
              <h4>Red Team Bans</h4>
              <ul>
                {bannedItems
                  .filter(ban => ban.team === TEAMS.RED)
                  .map((ban, index) => (
                    <li key={index}>
                      {ban.item} {ban.player && `(by ${ban.player})`}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanPhase;
