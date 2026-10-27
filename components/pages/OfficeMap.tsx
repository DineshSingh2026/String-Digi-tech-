import { about, company, footer, pagesUi } from "@/content/copy";
import css from "./widgets.module.css";

// Stylised, not to scale: main island, Jurong Island, Sentosa, Pulau Ubin, Johor shoreline.
const ISLAND =
  "M92 252 C 104 232, 128 214, 166 204 C 192 196, 204 176, 236 156 C 262 140, 284 122, 322 108 C 352 98, 384 96, 414 110 C 432 102, 452 92, 488 90 C 520 90, 540 104, 566 116 C 594 128, 612 134, 640 146 C 668 156, 696 160, 724 172 C 748 182, 762 200, 752 222 C 742 242, 718 254, 690 268 C 656 284, 624 296, 590 308 C 566 318, 548 332, 520 324 C 500 334, 480 344, 450 344 C 420 344, 398 334, 372 320 C 350 308, 332 300, 304 306 C 276 312, 252 302, 222 294 C 184 286, 140 284, 108 272 C 96 268, 88 262, 92 252 Z";
const JURONG = "M300 330 C 318 322, 352 326, 372 336 C 384 346, 368 362, 344 364 C 318 366, 296 356, 292 344 C 290 338, 294 334, 300 330 Z";
const SENTOSA = "M470 362 C 486 354, 512 356, 524 362 C 530 368, 516 374, 498 374 C 482 374, 466 370, 470 362 Z";
const UBIN = "M640 112 C 660 104, 694 106, 716 116 C 724 122, 712 130, 690 130 C 668 130, 646 126, 640 112 Z";
const JOHOR = "M0 70 C 80 60, 150 82, 230 70 S 380 48, 470 58 S 640 74, 720 62 S 800 72, 800 72";

// Approximate position of the registered office (Jurong East) on this stylised map.
const PIN = { x: 300, y: 238 };

export default function OfficeMap() {
  return (
    <figure className="panel relative overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-3">
          <span className="panel-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {about.officeHeading}
        </span>
        <span className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          {pagesUi.about.grid}
        </span>
      </div>
      <div className="relative aspect-[5/3] w-full">
        <svg viewBox="0 0 800 480" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="om-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="rgba(233,238,243,0.05)" strokeWidth="1" />
            </pattern>
            <pattern id="om-dots" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="0.9" fill="rgba(233,238,243,0.16)" />
            </pattern>
            <radialGradient id="om-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
            <clipPath id="om-clip">
              <path d={ISLAND} />
            </clipPath>
          </defs>
          <rect width="800" height="480" fill="url(#om-grid)" />
          {/* Johor shoreline */}
          <path d={`${JOHOR} L800 0 L0 0 Z`} fill="rgba(233,238,243,0.025)" />
          <path d={JOHOR} fill="none" stroke="rgba(233,238,243,0.18)" strokeDasharray="3 5" />
          {/* islands */}
          {[JURONG, SENTOSA, UBIN].map((d) => (
            <path key={d} d={d} fill="url(#om-dots)" stroke="rgba(233,238,243,0.22)" strokeWidth="1" />
          ))}
          <path d={ISLAND} fill="rgba(18,24,33,0.85)" />
          <path d={ISLAND} fill="url(#om-dots)" />
          <path d={ISLAND} fill="none" stroke="rgba(233,238,243,0.35)" strokeWidth="1.4" />
          {/* contour offsets */}
          <path d={ISLAND} fill="none" stroke="rgba(233,238,243,0.07)" strokeWidth="18" />
          {/* crosshair through pin */}
          <g clipPath="url(#om-clip)">
            <line x1="0" x2="800" y1={PIN.y} y2={PIN.y} stroke="var(--accent)" strokeOpacity="0.35" strokeDasharray="2 4" />
            <line x1={PIN.x} x2={PIN.x} y1="0" y2="480" stroke="var(--accent)" strokeOpacity="0.35" strokeDasharray="2 4" />
          </g>
          <line x1="0" x2="800" y1={PIN.y} y2={PIN.y} stroke="var(--accent)" strokeOpacity="0.1" />
          <line x1={PIN.x} x2={PIN.x} y1="0" y2="480" stroke="var(--accent)" strokeOpacity="0.1" />
          {/* pin */}
          <circle cx={PIN.x} cy={PIN.y} r="70" fill="url(#om-glow)" />
          <circle cx={PIN.x} cy={PIN.y} r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" className={css.pulse} />
          <circle cx={PIN.x} cy={PIN.y} r="12" fill="none" stroke="var(--accent)" strokeOpacity="0.5" />
          <circle cx={PIN.x} cy={PIN.y} r="5" fill="var(--accent)" />
          {/* compass */}
          <g transform="translate(748 420)" stroke="rgba(233,238,243,0.4)" fill="none">
            <circle r="16" />
            <path d="M0 -12 L4 2 L0 -1 L-4 2 Z" fill="var(--accent)" stroke="none" />
          </g>
        </svg>
        {/* callout */}
        <div className="absolute left-[calc(37.5%+28px)] top-[calc(49.6%-22px)] hidden items-center gap-2 md:flex">
          <span aria-hidden="true" className="h-px w-8 bg-accent/70" />
          <span className="mono rounded-md border border-accent/40 bg-bg/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-text backdrop-blur">
            {company.addressParts.postalCode} · {pagesUi.about.country}
          </span>
        </div>
      </div>
      <figcaption className="grid grid-cols-1 gap-4 border-t border-white/[0.06] p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <address className="not-italic">
          <span className="block text-[15px] text-text">{company.legalName}</span>
          <span className="mt-1 block text-[14px] text-muted">{company.address}</span>
        </address>
        <span className="mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {footer.uenLabel} <span className="text-text">{company.uen}</span>
        </span>
      </figcaption>
    </figure>
  );
}
