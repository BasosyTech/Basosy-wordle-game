import { WORDS } from "./words.js";
import * as UI from "./ui.js";
import { getRandomItem, getElapsedTimeText } from "./utils.js";
import { evaluateGuess, calculateScore } from "./logic.js";
import {
  getInitialGameState,
  resetGameState,
  prepareNextAttempt,
  playerStats,
} from "./state.js";
// Selectors
// start Screen
const startScreen = document.querySelector(".start-screen");
const startBtn = document.getElementById("start-game-btn");
// Game Screen
const gameElements = {
  gameSection: document.querySelector(".game-screen"),
  currentAttempt: document.querySelector(".game-screen__current-attempt"),
  maxAttempts: document.querySelector(".game-screen__max-attempts"),
  grid: document.querySelector(".tries-container__rows"),
  hintCountElements: document.querySelectorAll(".game-screen__hint-count"),
  hintBtn: document.querySelector(".game-screen__btn--hint"),
  checkBtn: document.querySelector(".game-screen__btn--check"),
  keyboard: document.querySelector(".keyboard"),
  toastContainer: document.querySelector(".game-screen__toasts"),
};
// modalElements
const modalElements = {
  dialog: document.querySelector(".result-modal"),
  winIcon: document.querySelector(".result-modal__svg--win"),
  loseIcon: document.querySelector(".result-modal__svg--lose"),
  title: document.querySelector(".result-modal__title"),
  description: document.querySelector(".result-modal__description"),
  wordLabel: document.querySelector(".result-modal__word-label"),
  lettersContainer: document.querySelector(".result-modal__word-letters"),
  hintsUsedValue: document.querySelector(".result-modal__value--hint"),
  streak: document.querySelector(".result-modal__value--streak"),
  scoreBox: document.querySelector(".result-modal__box--score"),
  score: document.querySelector(".result-modal__value--score"),
  timerBox: document.querySelector(".result-modal__box--timer"),
  timerValue: document.querySelector(".result-modal__value--timer"),
  againBtn: document.querySelector(".result-modal__btn"),
};
// Config
const GAME_CONFIG = {
  STATUS_PRIORITY: {
    absent: 1,
    present: 2,
    correct: 3,
  },
  MODAL: {
    win: (attempt, max) => ({
      title: "You Won!",
      description: `You Guessed The Word In <span class="result-modal__your-attempt">${attempt}</span> Of <span class="result-modal__max-attempts">${max}</span> Tries`,
      wordLabel: "Solved Word",
      modalColor: "#a33900",
    }),
    lose: () => ({
      title: "Game Over",
      description: `Out of attempts! Better luck next time.`,
      wordLabel: "Target Word",
      modalColor: "#64748b",
    }),
  },
  SCORING: {
    INITIAL_SCORE: 100,
    ATTEMPT_PENALTY: 15,
    HINT_PENALTY: 10,
    MIN_WIN_SCORE: 10,
  },
  HINT_COUNT: 2,
  MAX_ATTEMPTS: 5,
};
const gameState = getInitialGameState(GAME_CONFIG);
const keyboardMap = UI.createKeyboardMap(gameElements.keyboard);
startBtn.addEventListener("click", () => startGame());
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Escape" && modalElements.dialog.open) {
    e.preventDefault();
    return;
  }
  if (gameElements.gameSection.hidden || gameState.isGameOver) return;
  if (e.key === "Enter") {
    if (gameState.guessedWord.length < gameState.targetWord.length) return;
    e.preventDefault();
    checkAnswer();
    return;
  }
  if (e.key === "Backspace") {
    handleBackspace();
    return;
  }
  if (/^[a-zA-Z]$/.test(e.key)) {
    handleLetterInput(e.key.toUpperCase());
    return;
  }
  if (/^[\u0600-\u06FF]$/.test(e.key)) {
    UI.showToast(
      "Switch keyboard language to English",
      gameElements.toastContainer,
    );
    return;
  }
});
gameElements.hintBtn.addEventListener("click", handleHint);
gameElements.checkBtn.addEventListener("click", checkAnswer);
gameElements.keyboard.addEventListener("click", handleVirtualKeyboardClick);
modalElements.againBtn.addEventListener("click", () => {
  modalElements.dialog.close();
  const previousWord = gameState.targetWord;
  resetGameState(gameState, GAME_CONFIG);
  UI.resetKeyboard(keyboardMap);
  gameElements.hintBtn.disabled = false;
  document.activeElement?.blur();
  startGame(previousWord);
});
function startGame(previousWord = "") {
  startScreen.hidden = true;
  gameElements.gameSection.hidden = false;
  let nextWord;
  do {
    nextWord = getRandomItem(WORDS);
  } while (nextWord === previousWord);
  gameState.targetWord = nextWord;
  for (let i = 0; i < gameState.targetWord.length; i++)
    gameState.availableHintIndices.push(i);
  gameElements.currentAttempt.textContent = gameState.currentAttempt;
  gameElements.maxAttempts.textContent = gameState.maxAttempts;
  UI.updateHintsUI(gameElements.hintCountElements, gameState.hintsRemaining);
  gameElements.grid.replaceChildren(
    UI.createGuessGrid(gameState.maxAttempts, gameState.targetWord.length),
  );
  const currentRow = UI.getCurrentRow(
    gameElements.grid.children,
    gameState.currentAttempt,
  );
  UI.updateActiveIndex(currentRow, null, 0);
  gameState.startTime = performance.now();
}
function handleLetterInput(letter) {
  if (gameState.guessedWord.length >= gameState.targetWord.length) {
    return;
  }
  const rows = gameElements.grid.children;
  const targetIndex = gameState.guessedWord.length;
  gameState.guessedWord += letter;
  const currentRow = UI.getCurrentRow(rows, gameState.currentAttempt);
  UI.setCellLetter(currentRow, targetIndex, letter);
  UI.updateActiveIndex(currentRow, targetIndex, targetIndex + 1);
}
function handleBackspace() {
  const rows = gameElements.grid.children;
  if (gameState.guessedWord.length === 0) return;
  const currentRow = UI.getCurrentRow(rows, gameState.currentAttempt);
  const oldActiveIndex = gameState.guessedWord.length;
  // update State
  gameState.guessedWord = gameState.guessedWord.slice(0, -1);
  const newActiveIndex = gameState.guessedWord.length;
  // update DOM
  currentRow.children[newActiveIndex].textContent = "";
  UI.updateActiveIndex(currentRow, oldActiveIndex, newActiveIndex);
}
function checkAnswer() {
  if (gameState.isGameOver) return;
  const { guessedWord, targetWord, currentAttempt, maxAttempts } = gameState;
  const currentRow = UI.getCurrentRow(
    gameElements.grid.children,
    currentAttempt,
  );
  if (guessedWord.length < targetWord.length) {
    UI.shakeRow(currentRow);
    return;
  }
  currentRow.classList.replace(
    "tries-container__row--current",
    "tries-container__row--completed",
  );
  const evaluation = evaluateGuess(guessedWord, targetWord);
  UI.renderRowEvaluation(currentRow, evaluation);
  UI.updateKeyboard(
    keyboardMap,
    guessedWord,
    evaluation,
    GAME_CONFIG.STATUS_PRIORITY,
  );
  const isWin = guessedWord === targetWord;
  const isLoss = !isWin && currentAttempt >= maxAttempts;
  if (isWin || isLoss) {
    gameState.isGameOver = true;
    handleGameOver(isWin);
    return;
  }
  prepareNextAttempt(gameState);
  document.activeElement?.blur();
  const nextRow = UI.getCurrentRow(
    gameElements.grid.children,
    gameState.currentAttempt,
  );
  nextRow.classList.replace(
    "tries-container__row--disabled",
    "tries-container__row--current",
  );
  gameElements.currentAttempt.textContent = gameState.currentAttempt;
  UI.updateActiveIndex(nextRow, null, 0);
}
function handleHint() {
  if (gameState.isGameOver || gameState.hintsRemaining <= 0) return;
  if (gameState.guessedWord.length !== 0) {
    UI.showToast("Clear the row to use a hint", gameElements.toastContainer);
    return;
  }
  const position = getRandomItem(gameState.availableHintIndices);
  const letter = gameState.targetWord[position];
  gameState.hintsRemaining--;
  gameState.availableHintIndices.splice(
    gameState.availableHintIndices.indexOf(position),
    1,
  );
  UI.showToast(
    `Hint: Letter #${position + 1} is "${letter}"`,
    gameElements.toastContainer,
  );
  UI.updateHintsUI(gameElements.hintCountElements, gameState.hintsRemaining);
  if (gameState.hintsRemaining <= 0) gameElements.hintBtn.disabled = true;
}
function handleVirtualKeyboardClick(e) {
  if (gameState.isGameOver) return;
  const keyElement = e.target.closest(".keyboard__key");
  const key = keyElement?.dataset.key;
  if (!key) return;
  keyElement.classList.remove("keyboard__key--pressed");
  void keyElement.offsetWidth;
  keyElement.classList.add("keyboard__key--pressed");
  keyElement.addEventListener(
    "animationend",
    () => keyElement.classList.remove("keyboard__key--pressed"),
    { once: true },
  );
  if (key === "Backspace") {
    handleBackspace();
    return;
  }
  if (key === "Enter") {
    checkAnswer();
    return;
  }
  handleLetterInput(key);
}
function handleGameOver(isWin) {
  const time = getElapsedTimeText(gameState.startTime);
  const currentStreak = isWin
    ? playerStats.recordWin()
    : playerStats.recordLoss();
  const modalConfig = isWin
    ? GAME_CONFIG.MODAL.win(gameState.currentAttempt, gameState.maxAttempts)
    : GAME_CONFIG.MODAL.lose();
  const hintUsed = GAME_CONFIG.HINT_COUNT - gameState.hintsRemaining;
  const score = calculateScore(
    gameState.currentAttempt,
    hintUsed,
    GAME_CONFIG.SCORING,
  );
  UI.renderGameOverModal(modalElements, {
    isWin,
    time,
    currentStreak,
    modalConfig,
    hintUsed,
    score,
    targetWord: gameState.targetWord,
  });
}
