// gameUtils.js - Utility functions cho game logic
import { TEAMS, GAME_PHASES } from "./constants";

export const filterItemsByTeam = (items, team) => {
    return items.filter((item) => item.team === team);
};

export const formatPhaseTitle = (phase) => {
    return phase.toUpperCase();
};

export const createGameAction = (item, team, round) => {
    return {
        item,
        team,
        round,
    };
};

export const getTeamDisplayName = (teamKey) => {
    return TEAMS[teamKey] || teamKey;
};

export const isRoundValid = (config, roundNumber, phaseType) => {
    const rounds =
        phaseType === GAME_PHASES.BAN ? config.banRounds : config.pickRounds;
    return rounds && rounds[roundNumber];
};

export const hasNextRound = (config, currentRound, phaseType) => {
    return isRoundValid(config, currentRound + 1, phaseType);
};
