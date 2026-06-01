"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ADMIN_PASSWORD = "senha-de-teste";
process.env.RATE_LIMIT_SALT = "frase-aleatoria-de-teste";
process.env.SUPABASE_URL = "https://supabase.exemplo";
process.env.SUPABASE_SERVICE_ROLE_KEY = "chave-privada-de-teste";
process.env.SITE_URL = "https://voxdev.exemplo";

test("função de integridade responde com sucesso", async () => {
  const health = (await import("../api/health.mjs")).default;
  const response = await health.fetch(new Request("https://voxdev.exemplo/api/health"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("função de contatos retorna canais vazios antes da configuração", async () => {
  const previousFetch = global.fetch;
  global.fetch = async () => new Response("[]", { status: 200 });
  try {
    const contacts = (await import("../api/contacts.mjs")).default;
    const response = await contacts.fetch(new Request("https://voxdev.exemplo/api/contacts"));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).contacts.whatsapp.number, "");
  } finally {
    global.fetch = previousFetch;
  }
});

test("função administrativa rejeita senha incorreta", async () => {
  const adminContacts = (await import("../api/admin/contacts.mjs")).default;
  const response = await adminContacts.fetch(new Request("https://voxdev.exemplo/api/admin/contacts", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Password": "incorreta"
    },
    body: "{}"
  }));
  assert.equal(response.status, 401);
});

test("função de comentários rejeita spam antes de consultar o banco", async () => {
  const comments = (await import("../api/comments/index.mjs")).default;
  const response = await comments.fetch(new Request("https://voxdev.exemplo/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Maria", message: "!!!!!!!!!!!!" })
  }));
  assert.equal(response.status, 422);
});

test("funções de SEO usam o domínio configurado", async () => {
  const robots = (await import("../api/robots.mjs")).default;
  const sitemap = (await import("../api/sitemap.mjs")).default;
  const robotsResponse = await robots.fetch(new Request("https://preview.exemplo/api/robots"));
  const sitemapResponse = await sitemap.fetch(new Request("https://preview.exemplo/api/sitemap"));
  assert.match(await robotsResponse.text(), /https:\/\/voxdev\.exemplo\/sitemap\.xml/);
  assert.match(await sitemapResponse.text(), /<loc>https:\/\/voxdev\.exemplo\/<\/loc>/);
});
