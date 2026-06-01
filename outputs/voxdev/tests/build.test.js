"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

test("gera arquivos estáticos para publicação na Vercel", () => {
  childProcess.execFileSync(process.execPath, ["scripts/build-static.js"], {
    cwd: root,
    env: { ...process.env, SITE_URL: "https://voxdev.exemplo" }
  });
  const html = fs.readFileSync(path.join(root, "dist", "index.html"), "utf8");
  assert.equal(html.includes("{{SITE_URL}}"), false);
  assert.equal(html.includes("{{JSON_LD_HASH}}"), false);
  assert.match(html, /https:\/\/voxdev\.exemplo\/assets\/brand\/voxdev-identidade\.jpeg/);
  assert.match(html, /script-src 'self' 'sha256-/);
});
