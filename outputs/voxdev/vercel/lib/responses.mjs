export function json(status, payload, headers = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

export function methodNotAllowed(allowedMethods) {
  return json(405, { message: "Método não permitido." }, { Allow: allowedMethods.join(", ") });
}

export async function readJson(request) {
  const contentLength = Number.parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > 16 * 1024) {
    throw Object.assign(new Error("O conteúdo enviado é muito grande."), { statusCode: 413 });
  }
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Envie os dados em formato JSON válido."), { statusCode: 400 });
  }
}

export function handleError(error) {
  if (!error.statusCode || error.statusCode >= 500) console.error(error);
  return json(error.statusCode || 500, {
    message: error.statusCode ? error.message : "O servidor encontrou um erro inesperado."
  });
}
