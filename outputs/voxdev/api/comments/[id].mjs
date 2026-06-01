import { handleError, json, methodNotAllowed } from "../../vercel/lib/responses.mjs";
import { requireAdmin } from "../../vercel/lib/security.mjs";
import { supabaseRequest } from "../../vercel/lib/supabase.mjs";

export default {
  async fetch(request) {
    try {
      if (request.method !== "DELETE") return methodNotAllowed(["DELETE"]);
      requireAdmin(request);
      const id = new URL(request.url).pathname.split("/").pop();
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        throw Object.assign(new Error("Mensagem não encontrada."), { statusCode: 404 });
      }
      const query = new URLSearchParams({ id: `eq.${id}` });
      const deleted = await supabaseRequest(`/rest/v1/voxdev_comments?${query}`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" }
      });
      if (!deleted.length) throw Object.assign(new Error("Mensagem não encontrada."), { statusCode: 404 });
      return json(200, { message: "Mensagem excluída com sucesso." });
    } catch (error) {
      return handleError(error);
    }
  }
};
