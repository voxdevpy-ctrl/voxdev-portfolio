export function siteUrl(request) {
  const configuredUrl = process.env.SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return new URL(request.url).origin;
}
