// Sau "vite build": đóng dấu phiên bản vào dist/sw.js để máy đã cài app tự nhận bản mới.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const version = "stpc-" + ((process.env.GITHUB_SHA || "").slice(0, 7) || Date.now().toString(36));
const sw = path.join(dist, "sw.js");
fs.writeFileSync(sw, fs.readFileSync(sw, "utf8").replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`));
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log(`Đã đóng dấu phiên bản ${version} vào dist/sw.js`);
