import { json, methodNotAllowed } from "../vercel/lib/responses.mjs";

export default {
  async fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);
    return json(200, { status: "ok" });
  }
};
