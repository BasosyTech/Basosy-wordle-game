export function evaluateGuess(guess, target) {
  const result = Array(guess.length).fill("absent");
  const letterCounts = {};
  for (const letter of target) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  // To Check The Correct places
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      letterCounts[guess[i]]--;
    }
  }
  // to Check The present places
  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== "correct" && letterCounts[guess[i]] > 0) {
      result[i] = "present";
      letterCounts[guess[i]]--;
    }
  }
  return result;
}
export function calculateScore(currentAttempt, hintUsed, scoring) {
  const { INITIAL_SCORE, ATTEMPT_PENALTY, HINT_PENALTY, MIN_WIN_SCORE } =
    scoring;
  const attemptsCost = (currentAttempt - 1) * ATTEMPT_PENALTY;
  const hintsCost = hintUsed * HINT_PENALTY;
  const totalScore = INITIAL_SCORE - attemptsCost - hintsCost;
  return Math.max(MIN_WIN_SCORE, totalScore);
}
