import React, { useState } from 'react';
import './App.css';
import config from './config.json';
import { useGameState, useMultiplayerGameState } from './models/GameState';
import GameHeader from './components/GameHeader';
import GameMain from './components/GameMain';
import GameLobby from './components/GameLobby';
import { CSS_CLASSES } from './utils/constants';

function App() {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'single', 'multi'

  // Single player state
  const singlePlayerState = useGameState(config);

  // Multiplayer state
  const multiplayerState = useMultiplayerGameState();

  const handleModeSelect = mode => {
    setGameMode(mode);
  };

  const handleJoinRoom = roomData => {
    setGameMode('multi');
  };

  const handleBackToMenu = () => {
    if (gameMode === 'multi') {
      multiplayerState.leaveRoom();
    }
    setGameMode('menu');
  };

  const renderGameModeMenu = () => (
    <div className='game-mode-menu'>
      <div className='menu-container'>
        <h1>🎮 Ban-Pick WebApp</h1>
        <p className='subtitle'>Choose your game mode</p>

        <div className='mode-options'>
          <button className='mode-btn single' onClick={() => handleModeSelect('single')}>
            <div className='mode-icon'>👤</div>
            <h3>Single Player</h3>
            <p>Practice with AI or play alone</p>
          </button>

          <button className='mode-btn multi' onClick={() => handleModeSelect('multi')}>
            <div className='mode-icon'>👥</div>
            <h3>Multiplayer</h3>
            <p>Play with a friend online</p>
          </button>
        </div>

        <div className='features'>
          <h3>Features</h3>
          <ul>
            <li>🔄 Alternating ban-pick system</li>
            <li>🛡️ Item protection mechanics</li>
            <li>🎨 Real-time visual feedback</li>
            <li>📱 Mobile-responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSinglePlayer = () => (
    <div className={CSS_CLASSES.APP}>
      <GameHeader
        currentRound={singlePlayerState.currentRound}
        phase={singlePlayerState.phase}
        gameMode='Single Player'
        onBackToMenu={handleBackToMenu}
      />

      <GameMain
        phase={singlePlayerState.phase}
        currentRound={singlePlayerState.currentRound}
        bannedItems={singlePlayerState.bannedItems}
        pickedItems={singlePlayerState.pickedItems}
        config={config}
        onBanComplete={singlePlayerState.handleBanComplete}
        onPickComplete={singlePlayerState.handlePickComplete}
        onReset={singlePlayerState.resetGame}
        gameMode='single'
      />
    </div>
  );

  const renderMultiplayer = () => {
    if (multiplayerState.gameState.phase === 'lobby') {
      return <GameLobby onJoinRoom={handleJoinRoom} />;
    }

    // Ensure we have config before rendering game
    const gameConfig = multiplayerState.roomData?.config || config;

    return (
      <div className={CSS_CLASSES.APP}>
        <GameHeader
          currentRound={multiplayerState.gameState.currentRound}
          phase={multiplayerState.gameState.phase}
          gameMode='Multiplayer'
          roomData={multiplayerState.roomData}
          onBackToMenu={handleBackToMenu}
        />

        <GameMain
          phase={multiplayerState.gameState.phase}
          currentRound={multiplayerState.gameState.currentRound}
          bannedItems={multiplayerState.gameState.bannedItems}
          pickedItems={multiplayerState.gameState.pickedItems}
          config={gameConfig}
          onBanItem={multiplayerState.banItem}
          onPickItem={multiplayerState.pickItem}
          onReset={multiplayerState.resetGame}
          gameMode='multiplayer'
          gameState={multiplayerState.gameState}
          roomData={multiplayerState.roomData}
          connectionState={multiplayerState.connectionState}
        />
      </div>
    );
  };

  switch (gameMode) {
    case 'single':
      return renderSinglePlayer();
    case 'multi':
      return renderMultiplayer();
    default:
      return renderGameModeMenu();
  }
}

export default App;
