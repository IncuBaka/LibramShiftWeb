window.LibramData = class LibramData {
  constructor(id, data, file) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error(`Libram "${file}" must contain a JSON object.`);
    }
    if (typeof data.Name !== "string" || !data.Name.trim()) {
      throw new Error(`Libram "${file}" must include a non-empty "Name" string.`);
    }
    if (typeof data.Theme !== "string" || !/^#[0-9a-f]{6}$/i.test(data.Theme)) {
      throw new Error(`Libram "${file}" must include a six-digit hex "Theme" color.`);
    }

    this.id = id;
    this.name = data.Name;
    this.color = data.Theme;
  }
};
