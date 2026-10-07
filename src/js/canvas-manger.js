const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const gameWidth = canvas.width;
const gameHeight = canvas.height;

function resizeCanvas() {
  const scale = Math.min(
    window.innerWidth / gameWidth,
    window.innerHeight / gameHeight
  );
  const pixelRatio = window.devicePixelRatio || 1;
  const displayWidth = gameWidth * scale;
  const displayHeight = gameHeight * scale;

  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  canvas.width = Math.round(displayWidth * pixelRatio);
  canvas.height = Math.round(displayHeight * pixelRatio);
  context.setTransform(
    canvas.width / gameWidth,
    0,
    0,
    canvas.height / gameHeight,
    0,
    0
  );
}

async function startGame() {
  const playerData = new window.PlayerData();
  await playerData.load();
  window.playerData = playerData;

  const dataManager = new window.DataManager();
  await dataManager.load();
  window.dataManager = dataManager;

  const splashScreen = new window.SplashScreen(gameWidth, gameHeight);
  const mainMenu = new window.MainMenu(
    canvas,
    context,
    gameWidth,
    gameHeight,
    splashScreen,
    () => splashScreen.phase === "hidden",
    playerData,
    dataManager
  );
  await mainMenu.storyIntro.load();

  function update(deltaTime) {
    splashScreen.update(deltaTime);
    mainMenu.update(deltaTime);
  }

  function render() {
    context.clearRect(0, 0, gameWidth, gameHeight);
    mainMenu.render();
    splashScreen.render(context);
  }

  let previousFrameTime = 0;

  function gameLoop(timestamp) {
    const deltaTime = previousFrameTime
      ? Math.min((timestamp - previousFrameTime) / 1000, 0.1)
      : 0;
    previousFrameTime = timestamp;

    update(deltaTime);
    render();
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(gameLoop);
}

resizeCanvas();
startGame().catch(error => {
  console.error("Unable to start the game:", error);
});
