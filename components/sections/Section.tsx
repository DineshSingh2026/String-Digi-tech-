type Props = {
  children: React.ReactNode;
  scene?: string;
  id?: string;
  className?: string;
  scrim?: boolean;
  labelledBy?: string;
};

/** Transparent band: the WebGL scene shows through, a scrim keeps text legible. */
export default function Section({ children, scene, id, className = "", scrim = true, labelledBy }: Props) {
  return (
    <section
      id={id}
      data-scene={scene}
      aria-labelledby={labelledBy}
      className={`relative isolate bg-transparent ${className}`}
    >
      {scrim ? <div aria-hidden="true" className="scrim pointer-events-none absolute inset-0 -z-10" /> : null}
      {children}
    </section>
  );
}
