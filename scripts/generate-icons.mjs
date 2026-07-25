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

  const sourcePngPath = path.join(buildDir, "icon-source.png");
  const previewPngPath = path.join(buildDir, "icon-256-preview.png");
  const runtimePngPath = path.join(buildDir, "icon.png");
  const iconIcoPath = path.join(buildDir, "icon.ico");

  await sharp(inputPath)
    .extract({
      left: 6 * 192,
      top: 0,
      width: 192,
      height: 208
    })
    .png()
    .toFile(sourcePngPath);

  await sharp(sourcePngPath)
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(previewPngPath);

  await sharp(sourcePngPath)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(runtimePngPath);

  await fs.copyFile(runtimePngPath, runtimeIconPath);

  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoInputs = [];

  for (const size of icoSizes) {
    const sizedPngPath = path.join(buildDir, `icon-size-${size}.png`);
    await sharp(sourcePngPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(sizedPngPath);
    icoInputs.push(sizedPngPath);
  }

  const icoBuffer = await pngToIco(icoInputs);
  await fs.writeFile(iconIcoPath, icoBuffer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
