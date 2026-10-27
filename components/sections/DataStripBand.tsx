import DataStrip from "@/components/interactive/DataStrip";

/** Full-bleed live tape between the hero and the first content band. */
export default function DataStripBand() {
  return (
    <section className="relative z-10 border-y border-white/[0.07] bg-[linear-gradient(180deg,rgba(12,16,22,0.92),rgba(6,8,11,0.92))] shadow-[0_-1px_0_rgba(244,78,4,0.12),0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <DataStrip />
    </section>
  );
}
