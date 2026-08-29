import { app, BrowserWindow, ipcMain, shell } from "electron";
import electronUpdater from "electron-updater";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveApiBaseUrl, resolveLauncherUpdatesBaseUrl } from "@mmorpg/shared-config";
import { detectJava } from "./java.js";
import { launchMinecraft, type MinecraftLaunchInput } from "./minecraft.js";
import { fetchLauncherManifest, verifyAsset } from "./patcher.js";

const { autoUpdater } = electronUpdater;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE_URL = resolveApiBaseUrl(process.env.API_BASE_URL);
const LAUNCHER_UPDATES_BASE_URL = resolveLauncherUpdatesBaseUrl(process.env.LAUNCHER_UPDATES_BASE_URL);
const MINECRAFT_SERVER_HOST = process.env.MINECRAFT_SERVER_HOST ?? "localhost";
const MINECRAFT_SERVER_PORT = Number.parseInt(process.env.MINECRAFT_SERVER_PORT ?? "25565", 10);
const MINECRAFT_SESSION_HOST_SUFFIX = process.env.MINECRAFT_SESSION_HOST_SUFFIX ?? "127.0.0.1.sslip.io";

function createWindow() {
  const window = new BrowserWindow({
    width: 1120,
    height: 720,
    minWidth: 960,
    minHeight: 620,
    title: "MMORPG Launcher",
    backgroundColor: "#0b0f14",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  return window;
}

app.whenReady().then(() => {
  const window = createWindow();

  autoUpdater.autoDownload = false;
  void autoUpdater.checkForUpdates().catch(() => undefined);

  ipcMain.handle("launcher:config", () => ({
    apiBaseUrl: API_BASE_URL,
    updateBaseUrl: LAUNCHER_UPDATES_BASE_URL,
    minecraftServerHost: MINECRAFT_SERVER_HOST,
    minecraftServerPort: Number.isFinite(MINECRAFT_SERVER_PORT) ? MINECRAFT_SERVER_PORT : 25565,
    minecraftSessionHostSuffix: MINECRAFT_SESSION_HOST_SUFFIX
  }));

  ipcMain.handle("launcher:manifest", () => fetchLauncherManifest(LAUNCHER_UPDATES_BASE_URL));
  ipcMain.handle("launcher:java", () => detectJava());
  ipcMain.handle("launcher:launchMinecraft", (_event, input: MinecraftLaunchInput) => launchMinecraft(input, API_BASE_URL));
  ipcMain.handle("launcher:verifyAsset", (_event, input: { filePath: string; sha256: string }) => verifyAsset(input.filePath, input.sha256));
  ipcMain.handle("launcher:openExternal", (_event, url: string) => shell.openExternal(url));

  autoUpdater.on("update-available", (info) => {
    window.webContents.send("launcher:updateAvailable", info);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
