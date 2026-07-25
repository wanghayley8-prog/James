import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = process.cwd();
const inputPath = path.join(root, "app", "assets", "pets", "James", "spritesheet.webp");
const buildDir = path.join(root, "build");
const runtimeIconPath = path.join(root, "app", "assets", "icon.png");

async function main() {
  await fs.mkdir(buildDir, { recursive: true });

  const iconPngPath = path.join(buildDir, "icon.png");
  const iconIcoPath = path.join(buildDir, "icon.ico");
  const previewPngPath = path.join(buildDir, "icon-256.png");

  const icon = sharp(inputPath)
    .extract({ left: 6 * 192, top: 0, width: 192, height: 208 })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });

  await icon.png().toFile(previewPngPath);
  await sharp(previewPngPath)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(iconPngPath);

  await fs.copyFile(iconPngPath, runtimeIconPath);

  const icoBuffer = await pngToIco([iconPngPath]);
  await fs.writeFile(iconIcoPath, icoBuffer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
