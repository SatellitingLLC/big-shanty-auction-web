export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim();
  if (!configuredUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("SITE_URL must be an absolute HTTP(S) origin.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("SITE_URL must be an absolute HTTP(S) origin without a path, query, or fragment.");
  }

  return url;
}
