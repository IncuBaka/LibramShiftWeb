window.EnemyData = class EnemyData {
  constructor(id, data, file) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error(`Enemy "${file}" must contain a JSON object.`);
    }
    if (typeof data.Name !== "string" || !data.Name.trim()) {
      throw new Error(`Enemy "${file}" must include a non-empty "Name" string.`);
    }
    if (typeof data.Title !== "string" || !data.Title.trim()) {
      throw new Error(`Enemy "${file}" must include a non-empty "Title" string.`);
    }

    this.id = id;
    this.name = data.Name;
    this.title = data.Title;
  }
};
