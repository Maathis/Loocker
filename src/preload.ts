// preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    getVersion: () => ipcRenderer.invoke("get-app-version")
});