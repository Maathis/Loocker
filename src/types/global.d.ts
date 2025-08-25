export {};

declare global {
  interface Window {
    electron: {
      getVersion: () => Promise<string>,
      openFileDialog: (options: Electron.OpenDialogOptions) => Promise<string>,
      readFile: (filePath: string) => Promise<string>
    };
    appVersion: string;
  }
}
