export {};

declare global {
  interface Window {
    electron: {
      updateWindow: (action: "minimize" | "maximize" | "close") => void,
      onWindowSizeUpdate: (titlebar: HTMLElement) => void,
      removeAllWindowSizeUpdate: () => void,
      getVersion: () => Promise<string>,
      openFileDialog: (options: Electron.OpenDialogOptions) => Promise<string>,
      readFile: (filePath: string) => Promise<string>
    };
    appVersion: string;
  }
}
