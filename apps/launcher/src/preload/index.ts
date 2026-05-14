import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("launcher", {
  config: () => ipcRenderer.invoke("launcher:config"),
  manifest: () => ipcRenderer.invoke("launcher:manifest"),
  java: () => ipcRenderer.invoke("launcher:java"),
  launchMinecraft: (input: { accessToken: string; minecraftUsername?: string; serverSlug?: string }) => ipcRenderer.invoke("launcher:launchMinecraft", input),
  verifyAsset: (input: { filePath: string; sha256: string }) => ipcRenderer.invoke("launcher:verifyAsset", input),
  openExternal: (url: string) => ipcRenderer.invoke("launcher:openExternal", url),
  onUpdateAvailable: (callback: (info: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, info: unknown) => callback(info);
    ipcRenderer.on("launcher:updateAvailable", listener);
    return () => ipcRenderer.off("launcher:updateAvailable", listener);
  }
});
