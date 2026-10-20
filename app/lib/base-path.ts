/** URL prefix used when the static site is served under a subdirectory.
 *  Empty for vinext/dev and for a domain-root deploy. */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function withBasePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
