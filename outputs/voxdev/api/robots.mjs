import { methodNotAllowed } from "../vercel/lib/responses.mjs";
import { siteUrl } from "../vercel/lib/site-url.mjs";

export default {
  async fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);
    const body = `User-agent: *\nAllow: /\nSitemap: ${siteUrl(request)}/sitemap.xml\n`;
    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
};
