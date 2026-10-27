type P = { className?: string };
const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconGrid = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </svg>
);
export const IconChart = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M2.5 13.5h11" />
    <path d="M3.5 10.5l3-3.5 2.5 2 4-5" />
    <path d="M10.5 4h2.5v2.5" />
  </svg>
);
export const IconOrders = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 2.5h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
    <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" />
  </svg>
);
export const IconBell = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 11V7.5a4 4 0 0 1 8 0V11l1 1.5H3L4 11z" />
    <path d="M6.75 14a1.4 1.4 0 0 0 2.5 0" />
  </svg>
);
export const IconModel = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" />
    <path d="M6.5 2v2.5M9.5 2v2.5M6.5 11.5V14M9.5 11.5V14M2 6.5h2.5M2 9.5h2.5M11.5 6.5H14M11.5 9.5H14" />
  </svg>
);
export const IconSettings = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.6 3.6l1.05 1.05M11.35 11.35l1.05 1.05M3.6 12.4l1.05-1.05M11.35 4.65l1.05-1.05" />
  </svg>
);
export const IconSearch = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="M10.25 10.25L13.5 13.5" />
  </svg>
);
export const IconCheck = ({ className }: P) => (
  <svg {...base} className={className} strokeWidth={1.6}>
    <path d="M4 8.25l2.6 2.5L12 5.25" />
  </svg>
);
export const IconChevron = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 6.5l3 3 3-3" />
  </svg>
);
export const IconSlash = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M10 3L6 13" />
  </svg>
);
/** Brand-ish app mark: a small rotated lattice, drawn not imported. */
export const IconMark = ({ className }: P) => (
  <svg {...base} className={className} strokeWidth={1.4}>
    <path d="M8 1.75l5.4 3.1v6.3L8 14.25l-5.4-3.1v-6.3z" />
    <path d="M8 5.25l2.4 1.4v2.7L8 10.75 5.6 9.35v-2.7z" />
  </svg>
);

export const NAV_ICONS = [IconGrid, IconChart, IconOrders, IconBell, IconModel] as const;
