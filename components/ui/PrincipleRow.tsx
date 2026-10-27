/** Large numbered principle row with a hover state (accent rule grows, number lights up). */
export default function PrincipleRow({ index, text }: { index: number; text: string }) {
  const n = String(index + 1).padStart(2, "0");
  return (
    <div className="group relative grid grid-cols-[56px_1fr] items-center gap-4 border-t border-line py-7 transition-colors duration-500 hover:bg-[linear-gradient(90deg,rgba(244,78,4,0.07),transparent_60%)] md:grid-cols-[140px_1fr_auto] md:gap-8 md:py-9">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[-1px] h-px w-0 bg-accent transition-[width] duration-700 ease-[var(--ease-ui)] group-hover:w-full"
      />
      <span className="font-display text-[34px] leading-none text-transparent transition-colors duration-500 [-webkit-text-stroke:1px_var(--muted)] group-hover:text-accent group-hover:[-webkit-text-stroke:1px_var(--accent)] md:pl-4 md:text-[64px]">
        {n}
      </span>
      <p className="font-display text-[clamp(22px,2.8vw,40px)] leading-[1.1] text-text transition-transform duration-500 ease-[var(--ease-ui)] group-hover:translate-x-2">
        {text}
      </p>
      <span
        aria-hidden="true"
        className="mono hidden h-10 w-10 place-items-center rounded-full border border-line text-[14px] text-muted transition-colors duration-500 group-hover:border-accent group-hover:text-accent md:mr-4 md:grid"
      >
        →
      </span>
    </div>
  );
}
