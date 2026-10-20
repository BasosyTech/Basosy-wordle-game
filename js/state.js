export function getInitialGameState(config) {
  return {
    isGameOver: false,
    targetWord: "",
    guessedWord: "",
    hintsRemaining: config.HINT_COUNT,
    currentAttempt: 1,
    maxAttempts: config.MAX_ATTEMPTS,
    availableHintIndices: [],
    startTime: null,
  };
}
export function resetGameState(gameState, config) {
  Object.assign(gameState, getInitialGameState(config));
}
export function prepareNextAttempt(gameState) {
  gameState.currentAttempt++;
  gameState.guessedWord = "";
}
function getSavedStreak() {
  try {
    const savedStreak = Number(localStorage.getItem("wordle_streak"));
    return Number.isInteger(savedStreak) && savedStreak >= 0 ? savedStreak : 0;
  } catch (error) {
    console.error("Failed to read saved streak:", error);
    return 0;
  }
}
export const playerStats = {
  currentStreak: getSavedStreak(),
  recordWin() {
    try {
      this.currentStreak++;
      localStorage.setItem("wordle_streak", this.currentStreak);
    } catch (error) {
      console.error("Failed to save streak after win:", error);
    }
    return this.currentStreak;
  },
  recordLoss() {
    try {
      this.currentStreak = 0;
      localStorage.setItem("wordle_streak", 0);
    } catch (error) {
      console.error("Failed to save streak after loss:", error);
    }
    return this.currentStreak;
  },
};
