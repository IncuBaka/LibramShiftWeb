const fs = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "src", "json");
const outputPath = path.join(projectRoot, "src", "js", "game-data.js");

async function readJson(relativePath) {
  const filePath = path.join(sourceRoot, relativePath);
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents);
}

async function readJsonDirectory(relativePath) {
  const directoryPath = path.join(sourceRoot, relativePath);
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile() && /\.json$/i.test(entry.name))
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);

  if (files.length === 0) {
    throw new Error(`No JSON files found in src/json/${relativePath}.`);
  }

  return Object.fromEntries(
    await Promise.all(
      files.map(async file => [
        path.parse(file.name).name,
        await readJson(path.join(relativePath, file.name))
      ])
    )
  );
}

async function buildGameData() {
  const data = {
    player: await readJson("player.json"),
    intro: await readJson(path.join("events", "intro.json")),
    librams: await readJsonDirectory("librams"),
    enemies: await readJsonDirectory("enemies")
  };
  const output = `window.GameData = ${JSON.stringify(data, null, 2)};\n`;

  await fs.writeFile(outputPath, output);
  console.log(`Built ${path.relative(projectRoot, outputPath)}.`);
}

buildGameData().catch(error => {
  console.error("Unable to build game data:", error);
  process.exitCode = 1;
});
