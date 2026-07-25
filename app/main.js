const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, screen } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

let petWindow = null;
let tray = null;
let isPaused = false;

function getAssetPath(...parts) {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "assets");
  return path.join(basePath, ...parts);
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(getAssetPath("icon.png"));

  tray = new Tray(trayIcon);
  tray.setToolTip("James Desktop Pet");
  tray.setContextMenu(buildTrayMenu());
  tray.on("double-click", () => {
    if (petWindow) {
      petWindow.show();
      petWindow.focus();
    }
  });
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: isPaused ? "继续活动" : "暂停活动",
      click: () => {
        isPaused = !isPaused;
        if (petWindow) {
          petWindow.webContents.send("pet:set-paused", isPaused);
        }
        if (tray) {
          tray.setContextMenu(buildTrayMenu());
        }
      }
    },
    {
      label: "回到底部中央",
      click: () => {
        if (!petWindow) {
          return;
        }
        const workArea = screen.getPrimaryDisplay().workArea;
        const [width, height] = petWindow.getSize();
        petWindow.setPosition(
          Math.round(workArea.x + (workArea.width - width) / 2),
          Math.round(workArea.y + workArea.height - height - 24)
        );
      }
    },
    {
      label: "退出 James",
      click: () => {
        app.quit();
      }
    }
  ]);
}

function createWindow() {
  petWindow = new BrowserWindow({
    width: 280,
    height: 320,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false
    }
  });

  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.setAlwaysOnTop(true, "screen-saver");
  petWindow.setMenuBarVisibility(false);
  petWindow.setBackgroundColor("#00000000");

  const workArea = screen.getPrimaryDisplay().workArea;
  petWindow.setPosition(
    Math.round(workArea.x + (workArea.width - 280) / 2),
    Math.round(workArea.y + workArea.height - 320 - 24)
  );

  petWindow.loadFile(path.join(__dirname, "index.html"));
  petWindow.on("closed", () => {
    petWindow = null;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.codex.james.desktop-pet");
  createWindow();
  createTray();

  ipcMain.handle("pet:get-config", () => {
    return {
      petMetaUrl: pathToFileURL(getAssetPath("pets", "James", "pet.json")).href,
      spriteSheetUrl: pathToFileURL(getAssetPath("pets", "James", "spritesheet.webp")).href,
      audioDirectoryUrl: pathToFileURL(getAssetPath("audio")).href
    };
  });

  ipcMain.on("pet:toggle-pause", () => {
    isPaused = !isPaused;
    if (petWindow) {
      petWindow.webContents.send("pet:set-paused", isPaused);
    }
    if (tray) {
      tray.setContextMenu(buildTrayMenu());
    }
  });

  ipcMain.on("pet:show-menu", () => {
    const menu = Menu.buildFromTemplate([
      {
        label: isPaused ? "继续活动" : "暂停活动",
        click: () => {
          isPaused = !isPaused;
          if (petWindow) {
            petWindow.webContents.send("pet:set-paused", isPaused);
          }
          if (tray) {
            tray.setContextMenu(buildTrayMenu());
          }
        }
      },
      {
        label: "挥手一下",
        click: () => {
          if (petWindow) {
            petWindow.webContents.send("pet:trigger-action", "waving");
          }
        }
      },
      {
        label: "退出",
        click: () => app.quit()
      }
    ]);
    menu.popup({ window: petWindow });
  });

  ipcMain.on("pet:move-window", (_event, point) => {
    if (petWindow && point) {
      petWindow.setPosition(Math.round(point.x), Math.round(point.y));
    }
  });

  ipcMain.on("pet:quit", () => {
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
