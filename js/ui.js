export function createGuessGrid(rowCount, wordLength) {
  const fragment = document.createDocumentFragment();
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = document.createElement("div");
    row.classList.add(
      "tries-container__row",
      rowIndex === 0
        ? "tries-container__row--current"
        : "tries-container__row--disabled",
    );
    row.role = "row";
    for (let colIndex = 0; colIndex < wordLength; colIndex++) {
      const letterBox = document.createElement("span");
      letterBox.classList.add("tries-container__letter");
      letterBox.role = "gridcell";
      row.append(letterBox);
    }
    fragment.append(row);
  }
  return fragment;
}
export function createToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("game-screen__toast");
  toast.role = "status";
  toast.ariaLive = "polite";
  toast.textContent = message;
  return toast;
}
export function updateActiveIndex(currentRow, previousIndex, activeIndex) {
  if (!currentRow) return;
  const boxes = currentRow.children;
  if (previousIndex != null && boxes[previousIndex]) {
    boxes[previousIndex].classList.remove("tries-container__letter--active");
  }
  if (boxes[activeIndex]) {
    boxes[activeIndex].classList.add("tries-container__letter--active");
  }
}
export function getCurrentRow(rows, attemptNumber) {
  return rows[attemptNumber - 1];
}
export function setCellLetter(rowElement, cellIndex, letter) {
  const cell = rowElement.children[cellIndex];
  if (cell) cell.textContent = letter;
}
export function showToast(message, toastContainer) {
  let isDuplicate = false;
  const activeToasts = [];
  for (const toast of toastContainer.children) {
    const isExiting = toast.classList.contains("game-screen__toast--exiting");
    if (!isExiting) {
      if (toast.textContent === message) {
        isDuplicate = true;
        break;
      }
      activeToasts.push(toast);
    }
  }
  if (isDuplicate) return;
  if (activeToasts.length >= 2) dismissToastGracefully(activeToasts[0]);
  const toast = createToast(message);
  toastContainer.append(toast);
  toast.addEventListener(
    "animationend",
    (e) => {
      if (e.animationName === "toastFlow") toast.remove();
    },
    { once: true },
  );
}
export function updateHintsUI(hintCountElements, hintCount) {
  hintCountElements.forEach((el) => {
    el.textContent = hintCount;
  });
}
export function dismissToastGracefully(toast) {
  if (!toast || !toast.isConnected) return;
  toast.classList.add("game-screen__toast--exiting");
  toast.addEventListener(
    "animationend",
    (e) => {
      if (e.animationName === "toastQuickExit") toast.remove();
    },
    { once: true },
  );
}
export function shakeRow(row) {
  row.classList.remove("shake");
  void row.offsetWidth;
  row.classList.add("shake");
  row.addEventListener("animationend", () => row.classList.remove("shake"), {
    once: true,
  });
}
export function renderGameOverModal(modalElements, gameResult) {
  const {
    isWin,
    time,
    currentStreak,
    modalConfig,
    hintUsed,
    score,
    targetWord,
  } = gameResult;
  modalElements.winIcon.toggleAttribute("hidden", !isWin);
  modalElements.loseIcon.toggleAttribute("hidden", isWin);
  modalElements.scoreBox.hidden = !isWin;
  modalElements.timerBox.hidden = !isWin;
  modalElements.dialog.style.setProperty(
    "--modal-color",
    modalConfig.modalColor,
  );
  modalElements.title.textContent = modalConfig.title;
  modalElements.description.innerHTML = modalConfig.description;
  modalElements.wordLabel.textContent = modalConfig.wordLabel;
  renderResultWord(targetWord, modalElements.lettersContainer);
  modalElements.hintsUsedValue.textContent = hintUsed;
  modalElements.streak.textContent = currentStreak;
  modalElements.score.textContent = `${score}%`;
  modalElements.timerValue.textContent = time;
  modalElements.dialog.showModal();
  modalElements.dialog.focus();
}
export function renderResultWord(word, lettersContainer) {
  const fragment = document.createDocumentFragment();
  for (const char of word) {
    const letterBox = document.createElement("span");
    letterBox.className = "result-modal__letter";
    letterBox.textContent = char;
    fragment.appendChild(letterBox);
  }
  lettersContainer.replaceChildren(fragment);
}
export function renderRowEvaluation(row, evaluation) {
  const descriptions = {
    correct: "Correct letter in the correct position",
    present: "Letter is in the word, but in a different position",
    absent: "No remaining occurrence of this letter in the word",
  };
  [...row.children].forEach((box, i) => {
    box.classList.add(`tries-container__letter--${evaluation[i]}`);
    box.ariaLabel = `${box.textContent}: ${descriptions[evaluation[i]]}`;
  });
}
export function resetKeyboard(keyboardMap) {
  const keyboardKeys = Object.values(keyboardMap);
  for (const keyBtn of keyboardKeys) {
    delete keyBtn.dataset.status;
    keyBtn.classList.remove(
      "keyboard__key--present",
      "keyboard__key--absent",
      "keyboard__key--correct",
    );
  }
}
export function updateKeyboard(
  keyboardMap,
  guessedWord,
  evaluations,
  STATUS_PRIORITY,
) {
  for (let i = 0; i < guessedWord.length; i++) {
    const keyBtn = keyboardMap[guessedWord[i]];
    const currentStatus = keyBtn.dataset.status;
    const currentPower = STATUS_PRIORITY[currentStatus] || 0;
    const newStatus = evaluations[i];
    const newPower = STATUS_PRIORITY[newStatus];
    if (newPower > currentPower) {
      keyBtn.dataset.status = newStatus;
      keyBtn.classList.remove(
        "keyboard__key--present",
        "keyboard__key--absent",
        "keyboard__key--correct",
      );
      keyBtn.classList.add(`keyboard__key--${newStatus}`);
    }
  }
}
export function createKeyboardMap(keyboardContainer) {
  const map = {};
  if (!keyboardContainer) return map;
  keyboardContainer.querySelectorAll(".keyboard__key").forEach((btn) => {
    const key = btn.dataset.key;
    if (key && key !== "Enter" && key !== "Backspace") {
      map[key] = btn;
    }
  });
  return map;
}
