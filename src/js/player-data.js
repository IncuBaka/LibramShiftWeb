window.PlayerData = class PlayerData {
  constructor() {
    this.player = null;
    this.storageKey = "libram-shift-player";
    this.hasSave = false;
  }

  async load(useSaveData = false) {
    if (!window.GameData || !window.GameData.player) {
      throw new Error("Bundled player data must be loaded before loading player data.");
    }

    this.player = { ...window.GameData.player };
    if (typeof this.player.name !== "string" || !this.player.name.trim()) {
      throw new Error("Player data must include a non-empty name.");
    }

    this.hasSave = false;
    if (!useSaveData) {
      return;
    }

    const savedPlayer = localStorage.getItem(this.storageKey);
    if (savedPlayer) {
      try {
        const savedData = JSON.parse(savedPlayer);
        if (
          savedData &&
          typeof savedData.name === "string" &&
          savedData.name.trim()
        ) {
          this.player = {
            ...this.player,
            ...savedData
          };
          this.hasSave = true;
        }
      } catch (error) {
        console.warn("Unable to read saved player data.", error);
      }
    }
  }

  loadSaved() {
    return this.load(true);
  }

  setName(name) {
    if (!this.player) {
      throw new Error("Player data must be loaded before setting a name.");
    }
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("Player name must be a non-empty string.");
    }

    this.player.name = name.trim();
    localStorage.setItem(this.storageKey, JSON.stringify(this.player));
    this.hasSave = true;
  }

  selectLibram(libram) {
    if (!this.player) {
      throw new Error("Player data must be loaded before selecting a Libram.");
    }

    this.player.libram = {
      id: libram.id,
      name: libram.name,
      color: libram.color
    };

    if (this.hasSave) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.player));
    }
  }
};
