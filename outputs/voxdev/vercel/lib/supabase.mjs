export async function supabaseRequest(path, options = {}) {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceRoleKey) {
    throw Object.assign(new Error("A persistência ainda não foi configurada."), { statusCode: 503 });
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error("Não foi possível concluir a operação no banco de dados.");
    error.statusCode = response.status >= 500 ? 503 : response.status;
    error.databaseCode = payload?.code;
    throw error;
  }
  return payload;
}
