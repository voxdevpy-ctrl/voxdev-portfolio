"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const directories = ["api", "public/js", "scripts", "server", "vercel"];

function findJavascriptFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findJavascriptFiles(entryPath);
    return /\.(?:js|mjs)$/.test(entry.name) ? [entryPath] : [];
  });
}

const files = directories.flatMap((directory) => findJavascriptFiles(path.join(root, directory)));
files.forEach((file) => {
  childProcess.execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
});

console.log(`${files.length} arquivos JavaScript verificados.`);
