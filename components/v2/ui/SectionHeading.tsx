import Eyebrow from "./Eyebrow";

type Props = {
  eyebrow?: string;
  title: string;
  as?: "h1" | "h2";
  children?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

export default function SectionHeading({ eyebrow, title, as = "h2", children, align = "left", id, className = "" }: Props) {
  const Tag = as;
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-[760px] ${className}`}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <Tag id={id} className={as === "h1" ? "display" : "h2"}>
        {title}
      </Tag>
      {children ? <div className={`lead prose-body mt-5 ${centered ? "mx-auto" : ""}`}>{children}</div> : null}
    </div>
  );
}
