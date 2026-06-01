"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const env = require("./config/env");
const { readJson, sendJson, sendText } = require("./lib/http");
const { applySecurityHeaders, constantTimeEquals } = require("./lib/security");
const { JsonRepository } = require("./repositories/json-repository");
const { CommentService } = require("./services/comment-service");
const { ContactService } = require("./services/contact-service");

const root = path.resolve(__dirname, "..");
const publicDirectory = path.join(root, "public");
const indexTemplate = fs.readFileSync(path.join(publicDirectory, "index.html"), "utf8");
const jsonLdContent = indexTemplate.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || "";
const jsonLdHash = crypto.createHash("sha256").update(jsonLdContent).digest("base64");
const indexHtml = indexTemplate
  .replaceAll("{{SITE_URL}}", env.siteUrl)
  .replaceAll("{{JSON_LD_HASH}}", jsonLdHash);

const commentRepository = new JsonRepository(path.join(__dirname, "data", "comments.json"), []);
const contactRepository = new JsonRepository(path.join(__dirname, "data", "contacts.json"), {});
const commentService = new CommentService(commentRepository);
const contactService = new ContactService(contactRepository);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

function getIpAddress(request) {
  if (env.trustProxy) return String(request.headers["x-forwarded-for"] || "").split(",")[0].trim() || request.socket.remoteAddress;
  return request.socket.remoteAddress || "desconhecido";
}

function hasAdminAccess(request) {
  return constantTimeEquals(request.headers["x-admin-password"], env.adminPassword);
}

function requireAdmin(request, response) {
  if (!env.adminPassword) {
    sendJson(response, 503, { message: "A administração ainda não foi configurada no servidor." });
    return false;
  }
  if (!hasAdminAccess(request)) {
    sendJson(response, 401, { message: "Senha de administração inválida." });
    return false;
  }
  return true;
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return true;
  }
  if (request.method === "GET" && url.pathname === "/api/comments") {
    sendJson(response, 200, { comments: await commentService.list() });
    return true;
  }
  if (request.method === "POST" && url.pathname === "/api/comments") {
    const comment = await commentService.create(await readJson(request), getIpAddress(request));
    sendJson(response, 201, { comment });
    return true;
  }
  if (request.method === "DELETE" && url.pathname.startsWith("/api/comments/")) {
    if (!requireAdmin(request, response)) return true;
    await commentService.delete(decodeURIComponent(url.pathname.slice("/api/comments/".length)));
    sendJson(response, 200, { message: "Mensagem excluída com sucesso." });
    return true;
  }
  if (request.method === "GET" && url.pathname === "/api/contacts") {
    sendJson(response, 200, { contacts: await contactService.get() });
    return true;
  }
  if (request.method === "PUT" && url.pathname === "/api/admin/contacts") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, { contacts: await contactService.update(await readJson(request)) });
    return true;
  }
  return false;
}

function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${env.siteUrl}/</loc></url>\n</urlset>\n`;
}

async function serveStatic(response, pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    sendText(response, 200, indexHtml, "text/html; charset=utf-8", { "Cache-Control": "no-cache" });
    return;
  }
  if (pathname === "/robots.txt") {
    sendText(response, 200, `User-agent: *\nAllow: /\nSitemap: ${env.siteUrl}/sitemap.xml\n`);
    return;
  }
  if (pathname === "/sitemap.xml") {
    sendText(response, 200, sitemap(), "application/xml; charset=utf-8");
    return;
  }
  const requestedPath = path.resolve(publicDirectory, `.${decodeURIComponent(pathname)}`);
  if (!requestedPath.startsWith(`${publicDirectory}${path.sep}`)) {
    sendText(response, 403, "Acesso negado.");
    return;
  }
  try {
    const content = await fsPromises.readFile(requestedPath);
    sendText(response, 200, content, mimeTypes.get(path.extname(requestedPath).toLowerCase()) || "application/octet-stream", {
      "Cache-Control": pathname.startsWith("/assets/") ? "public, max-age=604800" : "public, max-age=3600"
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    sendText(response, 404, "Página não encontrada.");
  }
}

const server = http.createServer(async (request, response) => {
  applySecurityHeaders(response, { jsonLdHash, isProduction: env.isProduction });
  try {
    const url = new URL(request.url, env.siteUrl);
    if (url.pathname.startsWith("/api/")) {
      if (!(await handleApi(request, response, url))) sendJson(response, 404, { message: "Recurso não encontrado." });
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { message: "Método não permitido." });
      return;
    }
    await serveStatic(response, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, error.statusCode || 500, {
      message: error.statusCode ? error.message : "O servidor encontrou um erro inesperado."
    });
  }
});

if (require.main === module) {
  server.listen(env.port, () => {
    console.log(`VoxDev disponível em ${env.siteUrl}`);
    if (!env.adminPassword) console.warn("Defina ADMIN_PASSWORD antes de publicar.");
  });
}

module.exports = { server };
