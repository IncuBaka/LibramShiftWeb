window.PlayerData = class PlayerData {
  constructor() {
    this.player = null;
    this.storageKey = "libram-shift-player";
    this.hasSave = false;
  }

  async load(useSaveData = false) {
    const response = await fetch("json/player.json");
    if (!response.ok) {
      throw new Error(`Unable to load player data: ${response.status}`);
    }

    this.player = await response.json();
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
        if (savedData && savedData.name === this.player.name) {
          this.player = {
            ...this.player,
            ...savedData,
            name: this.player.name
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
