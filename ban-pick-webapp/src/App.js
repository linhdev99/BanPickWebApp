import React from "react";
import "./App.css";
import config from "./config.json";
import { useGameState } from "./models/GameState";
import GameHeader from "./components/GameHeader";
import GameMain from "./components/GameMain";
import { CSS_CLASSES } from "./utils/constants";

function App() {
    const {
        phase,
        currentRound,
        bannedItems,
        pickedItems,
        handleBanComplete,
        handlePickComplete,
        resetGame,
    } = useGameState(config);

    return (
        <div className={CSS_CLASSES.APP}>
            <GameHeader currentRound={currentRound} phase={phase} />

            <GameMain
                phase={phase}
                currentRound={currentRound}
                bannedItems={bannedItems}
                pickedItems={pickedItems}
                config={config}
                onBanComplete={handleBanComplete}
                onPickComplete={handlePickComplete}
                onReset={resetGame}
            />
        </div>
    );
}

export default App;
