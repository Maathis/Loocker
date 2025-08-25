// preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    getVersion: () => ipcRenderer.invoke("get-app-version"),
    openFileDialog: (options: Electron.OpenDialogOptions) =>
        ipcRenderer.invoke("dialog:openFile", options),
    readFile: (filePath: string) => ipcRenderer.invoke("file:read", filePath),
});