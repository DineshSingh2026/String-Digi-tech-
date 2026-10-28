import NextLink from "next/link";
import type { ComponentProps } from "react";
import { toV2 } from "@/lib/siteVersion";

/** next/link for the v2 design: internal paths from shared copy ("/about") resolve inside /v2. */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  return <NextLink href={typeof href === "string" ? toV2(href) : href} {...rest} />;
}
