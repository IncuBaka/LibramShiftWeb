window.DataManager = class DataManager {
  constructor() {
    this.librams = null;
    this.enemies = null;
  }

  async getJsonFiles(folder) {
    const response = await fetch(folder);
    if (!response.ok) {
      throw new Error(`Unable to list "${folder}": ${response.status}`);
    }

    const directoryUrl = new URL(folder, window.location.href);
    const directory = new DOMParser().parseFromString(
      await response.text(),
      "text/html"
    );
    const files = [...directory.querySelectorAll("a[href]")]
      .map(link => new URL(link.getAttribute("href"), directoryUrl))
      .filter(url => {
        const relativePath = decodeURIComponent(
          url.pathname.slice(directoryUrl.pathname.length)
        );
        return (
          url.origin === directoryUrl.origin &&
          !relativePath.includes("/") &&
          /\.json$/i.test(relativePath)
        );
      })
      .map(url =>
        decodeURIComponent(url.pathname.slice(directoryUrl.pathname.length))
      )
      .sort();

    if (files.length === 0) {
      throw new Error(`No JSON files found in "${folder}".`);
    }

    return files;
  }

  async loadJsonFile(folder, file) {
    const path = `${folder}${file}`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Unable to load "${path}": ${response.status}`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Unable to parse JSON in "${path}": ${error.message}`);
    }
  }

  async load() {
    const [libramFiles, enemyFiles] = await Promise.all([
      this.getJsonFiles("json/librams/"),
      this.getJsonFiles("json/enemies/")
    ]);
    const [librams, enemies] = await Promise.all([
      Promise.all(libramFiles.map(async file => {
        const id = file.slice(0, -5);
        const data = await this.loadJsonFile("json/librams/", file);
        return [id, new window.LibramData(id, data, `json/librams/${file}`)];
      })),
      Promise.all(enemyFiles.map(async file => {
        const id = file.slice(0, -5);
        const data = await this.loadJsonFile("json/enemies/", file);
        return new window.EnemyData(id, data, `json/enemies/${file}`);
      }))
    ]);

    this.librams = new Map(librams);
    this.enemies = enemies;
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
