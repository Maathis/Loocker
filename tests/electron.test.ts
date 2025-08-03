import path from 'path';
import { fileURLToPath } from 'url';
import { _electron as electron, ElectronApplication, test, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


test('launch Electron app', async () => {
  const electronPath = path.join(__dirname, '../.vite/build/main.cjs');

  const electronApp = await electron.launch({
    args: [
      electronPath
    ],
  });

  const window = await electronApp.firstWindow();
  expect(await window.title()).toBe("Hello World!");

  await electronApp.close();
});