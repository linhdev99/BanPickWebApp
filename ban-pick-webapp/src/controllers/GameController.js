// GameController.js - Logic điều khiển game
import { GAME_PHASES } from '../utils/constants';
import { isRoundValid } from '../utils/gameUtils';

class GameController {
  static getNextPhase(currentPhase, currentRound, config) {
    if (currentPhase === GAME_PHASES.BAN) {
      // Kiểm tra xem có pick round cho round hiện tại không
      if (isRoundValid(config, currentRound, GAME_PHASES.PICK)) {
        return { phase: GAME_PHASES.PICK, round: currentRound };
      } else {
        // Chuyển sang ban round tiếp theo
        const nextRound = currentRound + 1;
        if (isRoundValid(config, nextRound, GAME_PHASES.BAN)) {
          return { phase: GAME_PHASES.BAN, round: nextRound };
        } else {
          return { phase: GAME_PHASES.COMPLETE, round: currentRound };
        }
      }
    } else if (currentPhase === GAME_PHASES.PICK) {
      // Chuyển sang ban round tiếp theo
      const nextRound = currentRound + 1;
      if (isRoundValid(config, nextRound, 'ban')) {
        return { phase: GAME_PHASES.BAN, round: nextRound };
      } else {
        return { phase: GAME_PHASES.COMPLETE, round: currentRound };
      }
    }

    return { phase: currentPhase, round: currentRound };
  }

  static getInitialState() {
    return {
      phase: GAME_PHASES.BAN,
      currentRound: 1,
      bannedItems: [],
      pickedItems: [],
    };
  }

  static updateBannedItems(currentBannedItems, newBans) {
    return [...currentBannedItems, ...newBans];
  }

  static updatePickedItems(currentPickedItems, newPicks) {
    return [...currentPickedItems, ...newPicks];
  }
}

export default GameController;
