window.PlayerData = class PlayerData {
  constructor() {
    this.player = null;
    this.storageKey = "libram-shift-player";
  }

  async load() {
    const response = await fetch("data/player.json");
    if (!response.ok) {
      throw new Error(`Unable to load player data: ${response.status}`);
    }

    this.player = await response.json();
    if (typeof this.player.name !== "string" || !this.player.name.trim()) {
      throw new Error("Player data must include a non-empty name.");
    }

    const savedPlayer = localStorage.getItem(this.storageKey);
    if (savedPlayer) {
      const savedData = JSON.parse(savedPlayer);
      if (savedData.name === this.player.name) {
        this.player.libram = savedData.libram;
      }
    }
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
    localStorage.setItem(this.storageKey, JSON.stringify(this.player));
  }
};
