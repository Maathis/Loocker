// preload.ts
import { contextBridge } from "electron";
import * as path from "path";
import * as fs from "fs";

function getProjectVersion(): string {
  try {
    console.log("packageJsonPath")
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const file = fs.readFileSync(packageJsonPath, "utf8");
    const pkg = JSON.parse(file);
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

contextBridge.exposeInMainWorld("electron", {
  version: getProjectVersion(),
});
