import type { Metadata } from "next";
import { notFound } from "@/content/copy";
import Button from "@/components/v2/ui/Button";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = { title: notFound.h1, robots: { index: false } };

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center bg-bg pb-24 pt-32">
      <div className="container-x">
        <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
          <Logo variant="mark" height={56} />
          <p className="eyebrow mt-10">{notFound.eyebrow}</p>
          <h1 className="display mt-4" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
            {notFound.h1}
          </h1>
          <p className="lead mt-5">{notFound.body}</p>
          <Button href={notFound.cta.href} className="mt-10">
            {notFound.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
