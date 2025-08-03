import React, { useState } from 'react';
import './App.css';
import BanPhase from './components/BanPhase';
import PickPhase from './components/PickPhase';
import config from './config.json';

function App() {
  const [phase, setPhase] = useState('ban'); // 'ban', 'pick', 'complete'
  const [currentRound, setCurrentRound] = useState(1);
  const [bannedItems, setBannedItems] = useState([]);
  const [pickedItems, setPickedItems] = useState([]);

  const handleBanComplete = (newBans) => {
    const updatedBannedItems = [...bannedItems, ...newBans];
    setBannedItems(updatedBannedItems);
    
    // Kiểm tra xem có pick round cho round hiện tại không
    if (config.pickRounds && config.pickRounds[currentRound]) {
      setPhase('pick');
    } else {
      // Chuyển sang ban round tiếp theo
      const nextRound = currentRound + 1;
      if (config.banRounds && config.banRounds[nextRound]) {
        setCurrentRound(nextRound);
        setPhase('ban');
      } else {
        setPhase('complete');
      }
    }
  };

  const handlePickComplete = (newPicks) => {
    const updatedPickedItems = [...pickedItems, ...newPicks];
    setPickedItems(updatedPickedItems);
    
    // Chuyển sang ban round tiếp theo
    const nextRound = currentRound + 1;
    if (config.banRounds && config.banRounds[nextRound]) {
      setCurrentRound(nextRound);
      setPhase('ban');
    } else {
      setPhase('complete');
    }
  };

  const resetGame = () => {
    setPhase('ban');
    setCurrentRound(1);
    setBannedItems([]);
    setPickedItems([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ban-Pick WebApp</h1>
        <div className="phase-indicator">
          Round {currentRound} - {phase.toUpperCase()} Phase
        </div>
      </header>

      <main className="App-main">
        {phase === 'ban' && (
          <BanPhase 
            banRounds={{ [currentRound]: config.banRounds[currentRound] }}
            currentRound={currentRound}
            bannedItems={bannedItems}
            pickedItems={pickedItems}
            onComplete={handleBanComplete}
          />
        )}

        {phase === 'pick' && (
          <PickPhase 
            pickRounds={{ [currentRound]: config.pickRounds[currentRound] }}
            currentRound={currentRound}
            bannedItems={bannedItems}
            pickedItems={pickedItems}
            onComplete={handlePickComplete}
          />
        )}

        {phase === 'complete' && (
          <div className="game-complete">
            <h2>Ban-Pick Complete!</h2>
            
            <div className="results">
              <div className="banned-results">
                <h3>Banned Items:</h3>
                <ul>
                  {bannedItems.map((ban, index) => (
                    <li key={index}>
                      {ban.item} - {ban.team} Team (Round {ban.round})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="picked-results">
                <h3>Final Picks:</h3>
                <div className="team-results">
                  <div className="team-result">
                    <h4>Blue Team:</h4>
                    <ul>
                      {pickedItems
                        .filter(pick => pick.team === 'Blue')
                        .map((pick, index) => (
                          <li key={index}>
                            {pick.item} (Round {pick.round})
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="team-result">
                    <h4>Red Team:</h4>
                    <ul>
                      {pickedItems
                        .filter(pick => pick.team === 'Red')
                        .map((pick, index) => (
                          <li key={index}>
                            {pick.item} (Round {pick.round})
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={resetGame} className="reset-button">
              Start New Game
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
