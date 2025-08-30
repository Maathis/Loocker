// preload.ts
import { contextBridge, ipcRenderer } from "electron";

function updateTitlebarPadding(titlebar: HTMLElement, isMaximized: boolean) {
    titlebar.style.padding = isMaximized ? "0 0px" : "0 8px";
}

contextBridge.exposeInMainWorld("electron", {
    updateWindow: (action: "minimize" | "maximize" | "close") => ipcRenderer.invoke("window-action", action),
    onWindowSizeUpdate: (titlebar: HTMLElement) => {
        ipcRenderer.on("window-maximized", () => updateTitlebarPadding(titlebar, true));
        ipcRenderer.on("window-unmaximized", () => updateTitlebarPadding(titlebar, false));
    },
    removeAllWindowSizeUpdate: (titlebar: HTMLElement) => {
        ipcRenderer.removeAllListeners("window-maximized");
        ipcRenderer.removeAllListeners("window-unmaximized");
    },
    getVersion: () => ipcRenderer.invoke("get-app-version"),
    openFileDialog: (options: Electron.OpenDialogOptions) =>
        ipcRenderer.invoke("dialog:openFile", options),
    readFile: (filePath: string) => ipcRenderer.invoke("file:read", filePath),
});