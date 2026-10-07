window.DataManager = class DataManager {
  constructor() {
    this.librams = null;
    this.enemies = null;
  }

  async load() {
    const gameData = window.GameData;
    if (!gameData || !gameData.librams || !gameData.enemies) {
      throw new Error("Bundled game data must be loaded before loading game records.");
    }

    this.librams = new Map(
      Object.entries(gameData.librams).map(([id, data]) => [
        id,
        new window.LibramData(id, data, `json/librams/${id}.json`)
      ])
    );
    this.enemies = Object.entries(gameData.enemies).map(
      ([id, data]) => new window.EnemyData(id, data, `json/enemies/${id}.json`)
    );

    if (this.librams.size === 0 || this.enemies.length === 0) {
      throw new Error("Bundled game data must include Librams and enemies.");
    }
  }

  get(id) {
    if (!this.librams) {
      throw new Error("Game data must be loaded before retrieving a libram.");
    }

    const libram = this.librams.get(id);
    if (!libram) {
      throw new Error(`Libram "${id}" was not found.`);
    }

    return libram;
  }
};
