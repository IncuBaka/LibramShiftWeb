window.MainMenu = class MainMenu {
  constructor(canvas, context, width, height, splashScreen, canInteract, playerData, dataManager) {
    this.canvas = canvas;
    this.context = context;
    this.width = width;
    this.height = height;
    this.splashScreen = splashScreen;
    this.canInteract = canInteract;
    this.playerData = playerData;
    this.dataManager = dataManager;
    this.storyIntro = new window.StoryIntro(width, height);
    this.characterSelect = new window.CharacterSelect(width, height, playerData, dataManager);
    this.nameForm = document.querySelector("#name-entry");
    this.nameInput = document.querySelector("#player-name");
    this.page = "main";
    this.hitAreas = [];
    this.focusedIndex = 0;
    this.pointer = { x: -1, y: -1 };
    this.smoothScaling = true;
    this.audioLevels = {
      master: 1,
      music: 0.8,
      effects: 0.8
    };
    canvas.addEventListener("pointermove", event => {
      this.pointer = this.getCanvasPoint(event);
    });
    canvas.addEventListener("pointerleave", () => {
      this.pointer = { x: -1, y: -1 };
    });
    canvas.addEventListener("click", event => {
      if (this.splashScreen.phase !== "hidden") {
        this.splashScreen.skip();
        return;
      }

      if (this.page === "introduction") {
        if (this.canInteract()) {
          this.storyIntro.advance();
        }
        return;
      }

      if (this.canInteract()) {
        this.activateAt(this.getCanvasPoint(event));
      }
    });
    this.nameForm.addEventListener("submit", event => {
      event.preventDefault();
      if (
        !this.canInteract() ||
        this.page !== "introduction" ||
        !this.storyIntro.isNamePrompt
      ) {
        return;
      }

      const name = this.nameInput.value.trim();
      if (!name) {
        this.nameInput.setCustomValidity("Please enter a name.");
        return;
      }

      try {
        this.playerData.setName(name);
      } catch (error) {
        console.error("Unable to save player name:", error);
        return;
      }

      this.storyIntro.confirmName();
      this.nameForm.hidden = true;
      this.storyIntro.complete();
    });
    this.nameInput.addEventListener("input", () => {
      this.nameInput.setCustomValidity(
        this.nameInput.value.trim() ? "" : "Please enter a name."
      );
    });
    this.nameInput.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        this.nameInput.select();
      }
    });
    window.addEventListener("keydown", event => this.handleKeyDown(event));
  }

  get isPlaying() {
    return this.page === "game";
  }

  getCanvasPoint(event) {
    return window.Utils.getCanvasPoint(event, this.canvas, this.width, this.height);
  }

  handleKeyDown(event) {
    if (!this.canInteract()) {
      return;
    }

    if (this.page === "introduction") {
      if (
        event.key === "Enter" &&
        !event.isComposing &&
        this.storyIntro.isNamePrompt
      ) {
        event.preventDefault();
        this.nameForm.requestSubmit();
        return;
      }
      if (this.nameForm.contains(event.target)) {
        return;
      }
      if (event.code !== "Space") {
        return;
      }
      event.preventDefault();
      this.storyIntro.advance();
      return;
    }

    if (event.key === "Escape" || event.key === "Backspace") {
      if (this.page !== "main") {
        event.preventDefault();
        this.goBack();
      }
      return;
    }

    if (this.page === "character-select") {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "arrowdown") {
        event.preventDefault();
        const selections = ["libram", "enemy", "dream"];
        const currentIndex = selections.indexOf(
          this.characterSelect.activeSelection
        );
        const direction = key === "arrowdown" ? 1 : -1;
        this.characterSelect.activeSelection =
          selections[
            (currentIndex + direction + selections.length) % selections.length
          ];
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault();
        if (this.characterSelect.activeSelection === "enemy") {
          this.characterSelect.selectAdjacentEnemy(1);
        } else if (this.characterSelect.activeSelection === "libram") {
          this.selectAdjacentLibram(1);
        }
      } else if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        if (this.characterSelect.activeSelection === "enemy") {
          this.characterSelect.selectAdjacentEnemy(-1);
        } else if (this.characterSelect.activeSelection === "libram") {
          this.selectAdjacentLibram(-1);
        }
      } else if (["enter", " "].includes(key)) {
        event.preventDefault();
        if (this.characterSelect.activeSelection === "dream") {
          this.startCombat();
        }
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      this.focusedIndex =
        (this.focusedIndex + direction + this.hitAreas.length) %
        this.hitAreas.length;
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const area = this.hitAreas[this.focusedIndex];
      if (area && area.type === "slider") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        area.onChange(
          window.Utils.clamp(area.getValue() + direction * 0.05, 0, 1)
        );
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const area = this.hitAreas[this.focusedIndex];
      if (area) {
        if (area.type === "slider") {
          area.onChange(area.getValue() >= 1 ? 0 : area.getValue() + 0.1);
        } else {
          area.onActivate();
        }
      }
    }
  }

  selectAdjacentLibram(direction) {
    const classes = this.characterSelect.classes;
    const currentIndex = this.characterSelect.selectedIndex;
    const baseIndex = currentIndex < 0
      ? direction > 0 ? -1 : 0
      : currentIndex;
    const nextIndex =
      (baseIndex + direction + classes.length) % classes.length;
    this.characterSelect.select(nextIndex);
    this.focusedIndex = nextIndex;
  }

  activateAt(point) {
    const area = this.hitAreas.find(
      item =>
        point.x >= item.x &&
        point.x <= item.x + item.width &&
        point.y >= item.y &&
        point.y <= item.y + item.height
    );

    if (!area) {
      return;
    }

    if (Number.isInteger(area.selectionIndex)) {
      this.focusedIndex = area.selectionIndex;
    }
    if (area.type === "slider") {
      area.onChange(
        window.Utils.clamp((point.x - area.x) / area.width, 0, 1)
      );
    } else {
      area.onActivate();
    }
  }

  goBack() {
    let nextPage = "main";
    if (this.page === "game") {
      nextPage = "main";
    } else if (this.page === "audio" || this.page === "video") {
      nextPage = "options";
    }
    this.transitionTo(nextPage);
  }

  transitionTo(page) {
    this.splashScreen.transitionTo(() => {
      this.page = page;
      this.focusedIndex = 0;
    });
  }

  hasSaveData() {
    try {
      return Boolean(window.localStorage && window.localStorage.getItem("libram-shift-player"));
    } catch (error) {
      return false;
    }
  }

  async startNewGame() {
    await this.playerData.load(false);
    this.startIntroduction();
  }

  async startContinue() {
    await this.playerData.load(true);
    this.startIntroduction("Re-Entry");
  }

  startIntroduction(section = "Intro") {
    this.splashScreen.transitionTo(() => {
      this.page = "introduction";
      this.focusedIndex = 0;
      this.nameForm.hidden = true;
      this.storyIntro.start(section, () => this.transitionTo("character-select"));
    });
  }

  startCombat() {
    const enemy = this.dataManager.enemies[this.characterSelect.selectedEnemyIndex];
    if (!enemy) {
      throw new Error("A valid enemy must be selected before starting combat.");
    }

    if (!this.combatManager) {
      this.combatManager = new window.CombatManager(this.width, this.height);
    }

    this.combatManager.start(this.playerData.player, enemy);
    this.page = "game";
    this.focusedIndex = 0;
  }

  update(deltaTime) {
    if (this.page === "introduction") {
      this.storyIntro.update(deltaTime);
      this.updateNameForm();
    } else if (this.page === "character-select") {
      this.characterSelect.update(deltaTime);
    } else if (this.page === "game" && this.combatManager) {
      this.combatManager.update(deltaTime);
    }
  }

  render() {
    this.updateNameForm();
    this.hitAreas = [];
    this.context.save();
    this.drawBackground();

    if (this.page === "main") {
      this.drawMainPage();
    } else if (this.page === "options") {
      this.drawOptionsPage();
    } else if (this.page === "audio") {
      this.drawAudioPage();
    } else if (this.page === "video") {
      this.drawVideoPage();
    } else if (this.page === "introduction") {
      this.storyIntro.render(this.context);
      if (this.storyIntro.isNamePrompt && !this.storyIntro.nameConfirmed) {
        this.drawPlayerName();
      }
    } else if (this.page === "character-select") {
      this.hitAreas = this.characterSelect.render(
        this.context,
        this.pointer,
        this.characterSelect.activeSelection === "dream"
          ? -1
          : this.focusedIndex
      );
      const scale = this.height / 720;
      const buttonWidth = 200 * scale;
      this.drawButton("Dream", (this.width - buttonWidth) / 2, 8 * scale, buttonWidth, 56 * scale, () => {
        this.startCombat();
      }, false, this.characterSelect.activeSelection === "dream");
    } else if (this.page === "game" && this.combatManager) {
      this.combatManager.render(this.context);
    } else {
      this.drawGamePage();
    }

    this.context.restore();
  }

  drawPlayerName() {
    const name = this.nameInput.value;
    if (!name) {
      return;
    }

    const context = this.context;
    context.save();
    context.globalAlpha = this.storyIntro.alpha;
    context.textBaseline = "middle";
    context.font = "72px sans-serif";
    let textWidth = context.measureText(name).width;
    if (textWidth > 420) {
      context.font = `${72 * 420 / textWidth}px sans-serif`;
      textWidth = context.measureText(name).width;
    }

    const selectionStart = document.activeElement === this.nameInput
      ? this.nameInput.selectionStart
      : null;
    const selectionEnd = document.activeElement === this.nameInput
      ? this.nameInput.selectionEnd
      : null;
    if (
      selectionStart !== null &&
      selectionEnd !== null &&
      selectionEnd > selectionStart
    ) {
      const beforeSelection = name.slice(0, selectionStart);
      const selectedText = name.slice(selectionStart, selectionEnd);
      const selectedX = this.width / 2 - textWidth / 2 +
        context.measureText(beforeSelection).width;
      const selectedWidth = context.measureText(selectedText).width;
      const fontSize = Number.parseFloat(context.font);

      context.fillStyle = GameTheme.colors.accent;
      context.fillRect(
        selectedX,
        this.height * 0.51 - fontSize * 0.6,
        selectedWidth,
        fontSize * 1.2
      );
      context.textAlign = "left";
      context.fillStyle = GameTheme.colors.accentLight;
      context.fillText(beforeSelection, this.width / 2 - textWidth / 2, this.height * 0.51);
      context.fillStyle = GameTheme.colors.textOnAccent;
      context.fillText(selectedText, selectedX, this.height * 0.51);
      context.fillStyle = GameTheme.colors.accentLight;
      context.fillText(
        name.slice(selectionEnd),
        selectedX + selectedWidth,
        this.height * 0.51
      );
    } else {
      context.fillStyle = GameTheme.colors.accentLight;
      context.textAlign = "center";
      context.fillText(name, this.width / 2, this.height * 0.51);
    }
    context.restore();
  }

  updateNameForm() {
    const shouldShow = this.page === "introduction" &&
      this.storyIntro.isNamePrompt &&
      !this.storyIntro.nameConfirmed;
    if (shouldShow && this.nameForm.hidden) {
      this.nameInput.value = this.playerData.player.name;
      this.nameInput.setCustomValidity("");
      this.nameForm.hidden = false;
      this.nameInput.focus({ preventScroll: true });
    } else if (!shouldShow) {
      this.nameForm.hidden = true;
    }
  }

  drawBackground() {
    const gradient = this.context.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, GameTheme.colors.menuBackgroundStart);
    gradient.addColorStop(1, GameTheme.colors.pageBackground);
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);

  }

  drawMainPage() {
    const scale = this.height / 720;
    this.drawText("LIBRAM SHIFT", this.width / 2, 210 * scale, 54 * scale, GameTheme.colors.textPrimary);
    this.drawText("Astral Dreaming", this.width / 2, 264 * scale, 20 * scale, GameTheme.colors.playerName);

    const newGameButtonY = 350 * scale;
    const continueButtonY = this.hasSaveData() ? 430 * scale : null;
    const buttonWidth = 300 * scale;
    const buttonHeight = 64 * scale;

    this.drawButton("New Game", (this.width - buttonWidth) / 2, newGameButtonY, buttonWidth, buttonHeight, async () => {
      await this.startNewGame();
    });

    if (this.hasSaveData()) {
      this.drawButton("Continue", (this.width - buttonWidth) / 2, continueButtonY, buttonWidth, buttonHeight, async () => {
        await this.startContinue();
      });
    }

    this.drawButton("Options", (this.width - buttonWidth) / 2, (this.hasSaveData() ? 510 : 430) * scale, buttonWidth, buttonHeight, () => {
      this.transitionTo("options");
    });
  }

  drawOptionsPage() {
    this.drawPageTitle("Options");
    this.drawButton("Audio / Gameplay", (this.width - 400) / 2, 300, 400, 60, () => {
      this.transitionTo("audio");
    });
    this.drawButton("Video (Graphics)", (this.width - 400) / 2, 378, 400, 60, () => {
      this.transitionTo("video");
    });
    this.drawButton("Back", (this.width - 400) / 2, 486, 400, 54, () => this.goBack(), true);
  }

  drawAudioPage() {
    this.drawPageTitle("Audio / Gameplay Options");
    this.drawSlider("Master volume", "master", 306);
    this.drawSlider("Music volume", "music", 376);
    this.drawSlider("Sound effects", "effects", 446);
    this.drawButton("Back", (this.width - 400) / 2, 526, 400, 54, () => this.goBack(), true);
  }

  drawVideoPage() {
    this.drawPageTitle("Video (Graphics)");
    this.drawButton(
      `Fullscreen: ${document.fullscreenElement ? "On" : "Off"}`,
      (this.width - 400) / 2,
      326,
      400,
      60,
      () => this.toggleFullscreen()
    );
    this.drawButton(
      `Smooth scaling: ${this.smoothScaling ? "On" : "Off"}`,
      (this.width - 400) / 2,
      404,
      400,
      60,
      () => {
        this.smoothScaling = !this.smoothScaling;
        this.canvas.style.imageRendering = this.smoothScaling ? "auto" : "pixelated";
      }
    );
    this.drawButton("Back", (this.width - 400) / 2, 500, 400, 54, () => this.goBack(), true);
  }

  drawGamePage() {
    this.drawText(
      "Your game starts here",
      this.width / 2,
      this.height / 2 - 20,
      32,
      GameTheme.colors.textPrimary
    );
    this.drawButton("Return to menu", (this.width - 400) / 2, this.height / 2 + 48, 400, 58, () => {
      this.transitionTo("main");
    });
  }

  drawPageTitle(title) {
    this.drawText(title, this.width / 2, 210, 42, GameTheme.colors.textPrimary);
  }

  drawText(text, x, y, size, color) {
    this.context.fillStyle = color;
    this.context.font = `${size}px sans-serif`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(text, x, y);
  }

  drawButton(
    label,
    x,
    y,
    width,
    height,
    onActivate,
    secondary = false,
    focusedOverride = null
  ) {
    const index = this.hitAreas.length;
    const hovered =
      this.pointer.x >= x &&
      this.pointer.x <= x + width &&
      this.pointer.y >= y &&
      this.pointer.y <= y + height;
    const focused = focusedOverride === null
      ? index === this.focusedIndex
      : focusedOverride;
    const highlighted = hovered || focused;
    const context = this.context;

    context.fillStyle = hovered
      ? GameTheme.colors.accentDark
      : focused
        ? GameTheme.colors.accent
        : secondary
          ? GameTheme.colors.buttonBackgroundSecondary
          : GameTheme.colors.buttonBackground;
    context.beginPath();
    const scale = this.height / 720;
    context.roundRect(x, y, width, height, 8 * scale);
    context.fill();
    context.strokeStyle = highlighted
      ? GameTheme.colors.accentLight
      : GameTheme.colors.buttonBorder;
    context.lineWidth = 2 * scale;
    context.stroke();

    context.fillStyle = hovered
      ? GameTheme.colors.textPrimary
      : focused
        ? GameTheme.colors.textOnAccent
        : GameTheme.colors.textPrimary;
    context.font = `${22 * scale}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, x + width / 2, y + height / 2);

    this.hitAreas.push({
      type: "button",
      x,
      y,
      width,
      height,
      onActivate
    });
  }

  drawSlider(label, setting, y) {
    const x = 440;
    const width = 400;
    const value = this.audioLevels[setting];
    const context = this.context;
    const index = this.hitAreas.length;

    context.fillStyle = GameTheme.colors.textPrimary;
    context.font = "18px sans-serif";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(label, x, y - 12);
    context.textAlign = "right";
    context.fillStyle = GameTheme.colors.textSecondary;
    context.fillText(`${Math.round(value * 100)}%`, x + width, y - 12);

    context.fillStyle = GameTheme.colors.buttonBackgroundSecondary;
    context.beginPath();
    context.roundRect(x, y + 7, width, 14, 7);
    context.fill();
    context.fillStyle = GameTheme.colors.accent;
    context.beginPath();
    context.roundRect(x, y + 7, width * value, 14, 7);
    context.fill();

    if (index === this.focusedIndex) {
      context.strokeStyle = GameTheme.colors.accentLight;
      context.lineWidth = 2;
      context.strokeRect(x - 5, y - 20, width + 10, 48);
    }

    this.hitAreas.push({
      type: "slider",
      x,
      y: y - 20,
      width,
      height: 48,
      getValue: () => this.audioLevels[setting],
      onChange: nextValue => {
        this.audioLevels[setting] = nextValue;
      }
    });
  }

  toggleFullscreen() {
    const fullscreenChange = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();

    fullscreenChange.catch(error => {
      console.error("Unable to change fullscreen mode:", error);
    });
  }
};
