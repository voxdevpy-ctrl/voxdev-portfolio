import crypto from "node:crypto";
import { mapComment, normalize, validateComment } from "../../vercel/lib/data.mjs";
import { handleError, json, methodNotAllowed, readJson } from "../../vercel/lib/responses.mjs";
import { hashIpAddress } from "../../vercel/lib/security.mjs";
import { supabaseRequest } from "../../vercel/lib/supabase.mjs";

export default {
  async fetch(request) {
    try {
      if (request.method === "GET") return await listComments();
      if (request.method === "POST") return await createComment(request);
      return methodNotAllowed(["GET", "POST"]);
    } catch (error) {
      return handleError(error);
    }
  }
};

async function listComments() {
  const comments = await supabaseRequest("/rest/v1/voxdev_comments?select=id,name,message,created_at&order=created_at.desc&limit=500");
  return json(200, { comments: comments.map(mapComment) });
}

async function createComment(request) {
  const validation = validateComment(await readJson(request));
  if (!validation.ok) throw Object.assign(new Error(validation.message), { statusCode: 422 });

  const ipHash = hashIpAddress(request);
  const normalizedName = normalize(validation.value.name);
  const normalizedMessage = normalize(validation.value.message);
  const since = new Date(Date.now() - 60_000).toISOString();
  const cooldownQuery = new URLSearchParams({
    select: "id",
    ip_hash: `eq.${ipHash}`,
    created_at: `gte.${since}`,
    limit: "1"
  });
  const recentComments = await supabaseRequest(`/rest/v1/voxdev_comments?${cooldownQuery}`);
  if (recentComments.length) {
    throw Object.assign(new Error("Aguarde um minuto antes de publicar outra mensagem."), { statusCode: 429 });
  }

  const duplicateQuery = new URLSearchParams({
    select: "id",
    name_normalized: `eq.${normalizedName}`,
    message_normalized: `eq.${normalizedMessage}`,
    limit: "1"
  });
  const duplicateComments = await supabaseRequest(`/rest/v1/voxdev_comments?${duplicateQuery}`);
  if (duplicateComments.length) {
    throw Object.assign(new Error("Esta mensagem já foi publicada."), { statusCode: 409 });
  }

  const comment = {
    id: crypto.randomUUID(),
    name: validation.value.name,
    message: validation.value.message,
    name_normalized: normalizedName,
    message_normalized: normalizedMessage,
    ip_hash: ipHash,
    created_at: new Date().toISOString()
  };

  try {
    const inserted = await supabaseRequest("/rest/v1/voxdev_comments", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify([comment])
    });
    return json(201, { comment: mapComment(inserted[0]) });
  } catch (error) {
    if (error.databaseCode === "23505") {
      throw Object.assign(new Error("Esta mensagem já foi publicada."), { statusCode: 409 });
    }
    throw error;
  }
}
