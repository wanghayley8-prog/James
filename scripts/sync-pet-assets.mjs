import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "outputs", "ranger-tt");
const targetDir = path.join(root, "app", "assets", "pets", "James");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function main() {
  await ensureDir(targetDir);
  await ensureDir(path.join(root, "app", "assets", "audio"));

  const petMeta = JSON.parse(await fs.readFile(path.join(sourceDir, "pet.json"), "utf8"));
  const normalizedMeta = {
    ...petMeta,
    displayName: "James",
    description: "Windows desktop pet build for James.",
    spritesheetPath: "spritesheet.webp"
  };

  await fs.writeFile(path.join(targetDir, "pet.json"), `${JSON.stringify(normalizedMeta, null, 2)}\n`);
  await fs.copyFile(path.join(sourceDir, "spritesheet.webp"), path.join(targetDir, "spritesheet.webp"));
  await fs.copyFile(path.join(sourceDir, "contact-sheet.png"), path.join(targetDir, "contact-sheet.png"));
  await fs.copyFile(path.join(sourceDir, "look-directions.png"), path.join(targetDir, "look-directions.png"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
