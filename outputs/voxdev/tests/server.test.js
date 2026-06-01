"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

process.env.SITE_URL = "https://voxdev.exemplo";

const { server } = require("../server");

function listen() {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
}

function close() {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

test("publica página, cabeçalhos de segurança e recursos de SEO", async () => {
  await listen();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    const health = await fetch(`${baseUrl}/api/health`);
    const home = await fetch(`${baseUrl}/`);
    const robots = await fetch(`${baseUrl}/robots.txt`);
    const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
    const html = await home.text();
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");
    assert.equal(home.status, 200);
    assert.match(home.headers.get("content-security-policy"), /script-src 'self' 'sha256-/);
    assert.equal(html.includes("{{SITE_URL}}"), false);
    assert.equal(html.includes("{{JSON_LD_HASH}}"), false);
    assert.match(await robots.text(), /https:\/\/voxdev\.exemplo\/sitemap\.xml/);
    assert.match(await sitemap.text(), /<loc>https:\/\/voxdev\.exemplo\/<\/loc>/);
  } finally {
    await close();
  }
});
