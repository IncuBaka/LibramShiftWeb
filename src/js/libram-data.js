window.LibramData = class LibramData {
  constructor() {
    this.librams = null;
    this.files = [
      "brawler",
      "caster",
      "daring-duelist",
      "larcenist",
      "mental-mage",
      "savant",
      "sinister-shaman"
    ];
  }

  async load() {
    const librams = await Promise.all(this.files.map(async id => {
      const response = await fetch(`data/librams/${id}.json`);
      if (!response.ok) {
        throw new Error(`Unable to load libram "${id}": ${response.status}`);
      }

      const data = await response.json();
      if (
        !data ||
        typeof data.Name !== "string" ||
        !data.Name.trim() ||
        typeof data.Theme !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(data.Theme)
      ) {
        throw new Error(`Libram "${id}" must include a name and six-digit hex color.`);
      }

      return [id, { id, name: data.Name, color: data.Theme }];
    }));

    this.librams = new Map(librams);
  }

  get(id) {
    if (!this.librams) {
      throw new Error("Libram data must be loaded before retrieving a libram.");
    }

    const libram = this.librams.get(id);
    if (!libram) {
      throw new Error(`Libram "${id}" was not found.`);
    }

    return libram;
  }
};
