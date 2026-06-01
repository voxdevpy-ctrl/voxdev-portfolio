import crypto from "node:crypto";

export function hasAdminAccess(request) {
  return constantTimeEquals(request.headers.get("x-admin-password"), process.env.ADMIN_PASSWORD);
}

export function requireAdmin(request) {
  if (!process.env.ADMIN_PASSWORD) {
    throw Object.assign(new Error("A administração ainda não foi configurada."), { statusCode: 503 });
  }
  if (!hasAdminAccess(request)) {
    throw Object.assign(new Error("Senha de administração inválida."), { statusCode: 401 });
  }
}

export function hashIpAddress(request) {
  const salt = process.env.RATE_LIMIT_SALT || process.env.ADMIN_PASSWORD;
  if (!salt) {
    throw Object.assign(new Error("A proteção antispam ainda não foi configurada."), { statusCode: 503 });
  }
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ipAddress = forwardedFor.split(",")[0].trim() || request.headers.get("x-real-ip") || "desconhecido";
  return crypto.createHash("sha256").update(`${salt}:${ipAddress}`).digest("hex");
}

function constantTimeEquals(received, expected) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(String(received));
  const expectedBuffer = Buffer.from(String(expected));
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}
