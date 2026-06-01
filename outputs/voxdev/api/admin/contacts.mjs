import { defaultContacts, validateContacts } from "../../vercel/lib/data.mjs";
import { handleError, json, methodNotAllowed, readJson } from "../../vercel/lib/responses.mjs";
import { requireAdmin } from "../../vercel/lib/security.mjs";
import { supabaseRequest } from "../../vercel/lib/supabase.mjs";

export default {
  async fetch(request) {
    try {
      if (request.method !== "PUT") return methodNotAllowed(["PUT"]);
      requireAdmin(request);
      const validation = validateContacts(await readJson(request), defaultContacts);
      if (!validation.ok) throw Object.assign(new Error(validation.message), { statusCode: 422 });
      const records = await supabaseRequest("/rest/v1/voxdev_contacts?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify([{
          id: "main",
          config: validation.value,
          updated_at: new Date().toISOString()
        }])
      });
      return json(200, { contacts: records[0].config });
    } catch (error) {
      return handleError(error);
    }
  }
};
