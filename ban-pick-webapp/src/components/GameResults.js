// GameResults.js - Component hiển thị kết quả cuối game
import React from 'react';
import { CSS_CLASSES, UI_MESSAGES, TEAMS } from '../utils/constants';
import { filterItemsByTeam } from '../utils/gameUtils';

const GameResults = ({ bannedItems, pickedItems, onReset }) => {
  const blueTeamPicks = filterItemsByTeam(pickedItems, TEAMS.BLUE);
  const redTeamPicks = filterItemsByTeam(pickedItems, TEAMS.RED);

  return (
    <div className={CSS_CLASSES.GAME_COMPLETE}>
      <h2>{UI_MESSAGES.GAME_COMPLETE}</h2>

      <div className={CSS_CLASSES.RESULTS}>
        <div className={CSS_CLASSES.BANNED_RESULTS}>
          <h3>{UI_MESSAGES.BANNED_ITEMS}</h3>
          <ul>
            {bannedItems.map((ban, index) => (
              <li key={index}>
                {ban.item} - {ban.team} Team (Round {ban.round})
              </li>
            ))}
          </ul>
        </div>

        <div className={CSS_CLASSES.PICKED_RESULTS}>
          <h3>{UI_MESSAGES.FINAL_PICKS}</h3>
          <div className={CSS_CLASSES.TEAM_RESULTS}>
            <div className={CSS_CLASSES.TEAM_RESULT}>
              <h4>{TEAMS.BLUE} Team:</h4>
              <ul>
                {blueTeamPicks.map((pick, index) => (
                  <li key={index}>
                    {pick.item} (Round {pick.round})
                  </li>
                ))}
              </ul>
            </div>
            <div className={CSS_CLASSES.TEAM_RESULT}>
              <h4>{TEAMS.RED} Team:</h4>
              <ul>
                {redTeamPicks.map((pick, index) => (
                  <li key={index}>
                    {pick.item} (Round {pick.round})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button onClick={onReset} className={CSS_CLASSES.RESET_BUTTON}>
        {UI_MESSAGES.START_NEW_GAME}
      </button>
    </div>
  );
};

export default GameResults;
