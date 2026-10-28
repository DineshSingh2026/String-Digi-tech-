// The site ships two designs side by side:
//   v1 "Classic" at the root (/about)       -> app/(v1)
//   v2 "Clean"   under /v2   (/v2/about)    -> app/(v2)/v2
export const V2_PREFIX = "/v2";

export function isV2Path(pathname: string): boolean {
  return pathname === V2_PREFIX || pathname.startsWith(`${V2_PREFIX}/`);
}

/** "/about" -> "/v2/about". Leaves anchors, external URLs, API and asset paths alone. */
export function toV2(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || isV2Path(href)) return href;
  if (/^\/(api|images|brand|_next)(\/|$)/.test(href)) return href;
  return href === "/" ? V2_PREFIX : `${V2_PREFIX}${href}`;
}

/** "/v2/about" -> "/about"; any other path is returned unchanged. */
export function fromV2(pathname: string): string {
  if (!isV2Path(pathname)) return pathname;
  return pathname.slice(V2_PREFIX.length) || "/";
}
