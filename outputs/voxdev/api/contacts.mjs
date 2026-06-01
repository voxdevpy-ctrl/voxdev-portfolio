import { mergeContacts } from "../vercel/lib/data.mjs";
import { handleError, json, methodNotAllowed } from "../vercel/lib/responses.mjs";
import { supabaseRequest } from "../vercel/lib/supabase.mjs";

export default {
  async fetch(request) {
    try {
      if (request.method !== "GET") return methodNotAllowed(["GET"]);
      const records = await supabaseRequest("/rest/v1/voxdev_contacts?select=config&id=eq.main&limit=1");
      return json(200, { contacts: mergeContacts(records[0]?.config) });
    } catch (error) {
      return handleError(error);
    }
  }
};
