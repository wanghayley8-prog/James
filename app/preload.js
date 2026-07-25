const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("petApi", {
  getConfig: () => ipcRenderer.invoke("pet:get-config"),
  togglePause: () => ipcRenderer.send("pet:toggle-pause"),
  showMenu: () => ipcRenderer.send("pet:show-menu"),
  moveWindow: (point) => ipcRenderer.send("pet:move-window", point),
  quit: () => ipcRenderer.send("pet:quit"),
  onPaused: (callback) => ipcRenderer.on("pet:set-paused", (_event, paused) => callback(paused)),
  onAction: (callback) => ipcRenderer.on("pet:trigger-action", (_event, action) => callback(action))
});
