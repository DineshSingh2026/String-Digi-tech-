import { company } from "@/content/copy";

type Crumb = { name: string; path: string };

/** JSON-LD BreadcrumbList only (no visible UI). Home is prepended automatically. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: company.wordmark, path: "/" }, ...items];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: new URL(c.path, company.url).toString(),
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
