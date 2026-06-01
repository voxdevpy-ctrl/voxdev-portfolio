"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicDirectory = path.join(root, "public");
const outputDirectory = path.join(root, "dist");

function resolveSiteUrl() {
  const configuredUrl = process.env.SITE_URL;
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const deploymentUrl = process.env.VERCEL_URL;
  const siteUrl = configuredUrl || productionUrl || deploymentUrl || "http://localhost:3000";
  return (/^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`).replace(/\/+$/, "");
}

function buildIndex() {
  const templatePath = path.join(publicDirectory, "index.html");
  const template = fs.readFileSync(templatePath, "utf8");
  const jsonLdContent = template.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || "";
  const jsonLdHash = crypto.createHash("sha256").update(jsonLdContent).digest("base64");
  return template
    .replaceAll("{{SITE_URL}}", resolveSiteUrl())
    .replaceAll("{{JSON_LD_HASH}}", jsonLdHash);
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.cpSync(publicDirectory, outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "index.html"), buildIndex(), "utf8");

console.log(`Arquivos estáticos gerados em ${outputDirectory}`);
