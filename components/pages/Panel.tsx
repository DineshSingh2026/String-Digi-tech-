type Props = {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: "div" | "section" | "aside";
  labelledBy?: string;
};

/** Glass terminal card: dotted header, body, optional footer strip. */
export default function Panel({ title, right, children, footer, className = "", bodyClassName = "p-5", as = "div", labelledBy }: Props) {
  const Tag = as;
  return (
    <Tag className={`panel overflow-hidden ${className}`} aria-labelledby={labelledBy}>
      <div className="panel-header">
        <span className="flex min-w-0 items-center gap-3">
          <span className="panel-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="truncate">{title}</span>
        </span>
        {right ? <span className="flex shrink-0 items-center gap-2">{right}</span> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
      {footer ? <div className="border-t border-white/[0.06] px-5 py-3">{footer}</div> : null}
    </Tag>
  );
}
