import Eyebrow from "./Eyebrow";

type Props = { eyebrow?: string; title: string; as?: "h1" | "h2"; children?: React.ReactNode; className?: string };

export default function SectionHeading({ eyebrow, title, as = "h2", children, className = "" }: Props) {
  const Tag = as;
  return (
    <div className={`max-w-[900px] ${className}`}>
      {eyebrow ? <Eyebrow className="mb-6">{eyebrow}</Eyebrow> : null}
      <Tag className={as === "h1" ? "h1" : "h2"}>{title}</Tag>
      {children ? <div className="prose-body mt-6 text-muted">{children}</div> : null}
    </div>
  );
}
