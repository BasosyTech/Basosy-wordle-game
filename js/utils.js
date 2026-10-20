export function formatTimer(time) {
  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
export function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}
export function getElapsedTimeText(startTime) {
  const endTime = performance.now();
  const totalSeconds = Math.floor((endTime - startTime) / 1000);
  return formatTimer(totalSeconds);
}
