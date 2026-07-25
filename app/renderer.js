const stageCanvas = document.getElementById("petCanvas");
const stageContext = stageCanvas.getContext("2d");
const pauseButton = document.getElementById("pauseButton");
const exitButton = document.getElementById("exitButton");
const petName = document.getElementById("petName");

const petState = {
  spriteSheet: null,
  layout: {
    columns: 8,
    rows: 11,
    cellWidth: 192,
    cellHeight: 208
  },
  actions: {
    idle: { row: 0, frames: 6, fps: 7 },
    waiting: { row: 1, frames: 6, fps: 7 },
    running: { row: 2, frames: 6, fps: 10 },
    jumping: { row: 3, frames: 5, fps: 10 },
    review: { row: 4, frames: 6, fps: 7 },
    failed: { row: 5, frames: 8, fps: 9 },
    waving: { row: 6, frames: 4, fps: 7 },
    runningRight: { row: 7, frames: 8, fps: 10 },
    runningLeft: { row: 8, frames: 8, fps: 10 },
    look: { row: 9, frames: 16, fps: 5 }
  },
  currentAction: "idle",
  actionStart: performance.now(),
  paused: false,
  x: 12,
  direction: 1,
  lastFrameTime: performance.now(),
  clickLockedUntil: 0
};

async function loadPet() {
  const config = await window.petApi.getConfig();
  const petMeta = await fetch(config.petMetaUrl).then((response) => response.json());
  petName.textContent = petMeta.displayName || "James";

  const image = new Image();
  image.src = config.spriteSheetUrl;
  await image.decode();
  petState.spriteSheet = image;
}

function frameForAction(actionName, now) {
  const action = petState.actions[actionName];
  const elapsed = (now - petState.actionStart) / 1000;
  const frameIndex = Math.floor(elapsed * action.fps) % action.frames;
  return { row: action.row, column: frameIndex };
}

function draw(now) {
  stageContext.clearRect(0, 0, stageCanvas.width, stageCanvas.height);
  if (!petState.spriteSheet) {
    requestAnimationFrame(draw);
    return;
  }

  if (!petState.paused) {
    animateMovement(now);
  }

  const { row, column } = frameForAction(petState.currentAction, now);
  const srcX = column * petState.layout.cellWidth;
  const srcY = row * petState.layout.cellHeight;
  stageContext.drawImage(
    petState.spriteSheet,
    srcX,
    srcY,
    petState.layout.cellWidth,
    petState.layout.cellHeight,
    petState.x,
    38,
    230,
    250
  );

  requestAnimationFrame(draw);
}

function animateMovement(now) {
  const delta = Math.min(50, now - petState.lastFrameTime);
  petState.lastFrameTime = now;
  const width = stageCanvas.width - 230;
  petState.x += petState.direction * delta * 0.02;

  if (petState.currentAction === "runningRight" || petState.currentAction === "runningLeft") {
    if (petState.x <= 0) {
      petState.x = 0;
      petState.direction = 1;
      switchAction("runningRight");
    } else if (petState.x >= width) {
      petState.x = width;
      petState.direction = -1;
      switchAction("runningLeft");
    }
    return;
  }

  const elapsed = now - petState.actionStart;
  if (elapsed > 4500) {
    const nextAction = petState.direction === 1 ? "runningRight" : "runningLeft";
    switchAction(nextAction);
  }

  if (petState.currentAction === "idle" && elapsed > 2000) {
    const choices = ["waiting", "review", "idle"];
    switchAction(choices[Math.floor(Math.random() * choices.length)]);
  }

  if (petState.currentAction !== "idle" && elapsed > 2800) {
    switchAction("idle");
  }
}

function switchAction(nextAction) {
  petState.currentAction = nextAction;
  petState.actionStart = performance.now();
}

function startDrag() {
  stageCanvas.classList.add("dragging");
}

function stopDrag() {
  stageCanvas.classList.remove("dragging");
}

function bindUi() {
  pauseButton.addEventListener("click", () => {
    window.petApi.togglePause();
  });

  exitButton.addEventListener("click", () => {
    window.petApi.quit();
  });

  stageCanvas.addEventListener("click", () => {
    if (performance.now() < petState.clickLockedUntil) {
      return;
    }
    petState.clickLockedUntil = performance.now() + 350;
    switchAction("waving");
  });

  stageCanvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    window.petApi.showMenu();
  });

  let dragOrigin = null;
  stageCanvas.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }
    dragOrigin = {
      screenX: event.screenX,
      screenY: event.screenY
    };
    startDrag();
  });

  window.addEventListener("mousemove", (event) => {
    if (!dragOrigin) {
      return;
    }
    const nextPoint = {
      x: window.screenX + (event.screenX - dragOrigin.screenX),
      y: window.screenY + (event.screenY - dragOrigin.screenY)
    };
    window.petApi.moveWindow(nextPoint);
    dragOrigin = {
      screenX: event.screenX,
      screenY: event.screenY
    };
  });

  window.addEventListener("mouseup", () => {
    dragOrigin = null;
    stopDrag();
  });

  window.petApi.onPaused((paused) => {
    petState.paused = paused;
    pauseButton.textContent = paused ? "继续" : "暂停";
    if (!paused) {
      petState.lastFrameTime = performance.now();
    }
  });

  window.petApi.onAction((action) => {
    if (action) {
      switchAction(action);
    }
  });
}

loadPet().then(() => {
  bindUi();
  requestAnimationFrame(draw);
});
