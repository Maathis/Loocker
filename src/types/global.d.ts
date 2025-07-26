export {};

declare global {
  interface Window {
    electron: {
      getVersion: () => Promise<string>;
    };
    appVersion: string;
  }
}
