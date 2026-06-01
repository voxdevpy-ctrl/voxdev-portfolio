"use strict";

function toBoolean(value) {
  return String(value || "").toLowerCase() === "true";
}

const port = Number.parseInt(process.env.PORT || "3000", 10);

module.exports = Object.freeze({
  adminPassword: process.env.ADMIN_PASSWORD || "",
  isProduction: process.env.NODE_ENV === "production",
  port: Number.isFinite(port) ? port : 3000,
  siteUrl: (process.env.SITE_URL || `http://localhost:${Number.isFinite(port) ? port : 3000}`).replace(/\/+$/, ""),
  trustProxy: toBoolean(process.env.TRUST_PROXY)
});
