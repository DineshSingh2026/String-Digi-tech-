"use client";
import { useEffect, useState } from "react";
import { home, interactive, bandsUi } from "@/content/copy";

// Approximate cash-equity session hours expressed in SGT (start, end; end may exceed 24 to wrap past midnight).
const HOURS: [number, number][] = [
  [8, 14],
  [9.5, 16],
  [9, 17],
  [16, 24.5],
  [21.5, 28],
];

const SIZE = 560;
const C = SIZE / 2;
const R_OUT = 262;
const TRACK0 = 200;
const TRACK_GAP = 22;
const R_CORE = 90;

function sgtMinutes(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return (h % 24) * 60 + m;
}

function fmtHour(hh: number): string {
  const x = ((hh % 24) + 24) % 24;
  const h = Math.floor(x);
  const m = Math.round((x - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function polar(r: number, hour: number): [number, number] {
  const a = (hour / 24) * Math.PI * 2 - Math.PI / 2;
  // rounded so server and client render identical attribute strings (no hydration mismatch)
  return [Math.round((C + r * Math.cos(a)) * 100) / 100, Math.round((C + r * Math.sin(a)) * 100) / 100];
}

function arc(r: number, start: number, end: number): string {
  const [x1, y1] = polar(r, start);
  const [x2, y2] = polar(r, end);
  const large = end - start > 12 ? 1 : 0;
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

function isOpen(mins: number, [s, e]: [number, number]): boolean {
  const h = mins / 60;
  return (h >= s && h < e) || (h + 24 >= s && h + 24 < e);
}

type Props = { lead?: React.ReactNode };

/** 24-hour SGT session clock (hero of the Singapore band) + session table. */
export default function SessionClock({ lead }: Props) {
  const [mins, setMins] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setMins(sgtMinutes(new Date()));
    update();
    let id = 0;
    const timeout = window.setTimeout(() => {
      update();
      id = window.setInterval(update, 60_000);
    }, (60 - new Date().getSeconds()) * 1000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(id);
    };
  }, []);

  const names = home.singapore.sessions;
  const tz = home.singapore.timezoneLabel;
  const c = interactive.sessionClock;
  const ui = bandsUi.singapore;
  const nowText = mins === null ? "--:--" : fmtHour(mins / 60);
  const openFlags = HOURS.map((r) => mins !== null && isOpen(mins, r));
  const openCount = openFlags.filter(Boolean).length;
  const nowH = mins === null ? 0 : mins / 60;

  return (
    <div className="grid grid-cols-12 items-center gap-x-6 gap-y-10 lg:grid-rows-[auto_auto]">
      <div className="col-span-12 self-end lg:col-span-5 lg:row-start-1">{lead}</div>
      <div className="order-3 col-span-12 self-start lg:order-none lg:col-span-5 lg:row-start-2">
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <span className="flex items-center gap-3">
              <span className="panel-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {ui.panelTitle}
            </span>
            <span className="flex items-center gap-2 tabular-nums">
              <span className="live-dot" aria-hidden="true" />
              {nowText} {tz}
            </span>
          </div>
          <table className="mono w-full text-[13px] tabular-nums">
            <caption className="sr-only">{c.ariaLabel}</caption>
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-muted">
                <th scope="col" className="px-4 py-2.5 font-normal">
                  {ui.session}
                </th>
                <th scope="col" className="px-4 py-2.5 font-normal">
                  {ui.hours}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-normal">
                  {ui.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {HOURS.map((range, i) => {
                const open = openFlags[i];
                return (
                  <tr key={names[i]} className={`border-t border-white/5 transition-colors ${open ? "bg-accent/[0.06]" : ""}`}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="flex items-center gap-3">
                        {/* ring key: which track on the clock this session is (outermost = first) */}
                        <svg viewBox="0 0 22 22" width="18" height="18" aria-hidden="true" className="shrink-0">
                          {HOURS.map((_, k) => (
                            <circle
                              key={k}
                              cx="11"
                              cy="11"
                              r={10 - k * 2}
                              fill="none"
                              stroke={k === i ? (open ? "var(--accent)" : "var(--text)") : "var(--muted)"}
                              strokeOpacity={k === i ? 1 : 0.4}
                              strokeWidth={k === i ? 1.4 : 1}
                            />
                          ))}
                        </svg>
                        <span className="text-text">{names[i]}</span>
                      </span>
                    </th>
                    <td className="px-4 py-3 text-muted">
                      {fmtHour(range[0])}–{fmtHour(range[1])}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {mins === null ? null : (
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${
                            open ? "border-accent/50 text-accent" : "border-line text-muted"
                          }`}
                        >
                          {open ? c.open : c.closed}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[52ch] text-[12px] leading-relaxed text-muted">{c.hoursNote}</p>
      </div>

      <div className="col-span-12 flex justify-center lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:justify-end">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${c.ariaLabel}. ${c.nowLabel}: ${nowText} ${tz}`}
          className="aspect-square w-full max-w-[600px]"
        >
          <defs>
            <radialGradient id="sc-core" cx="50%" cy="45%" r="60%">
              <stop offset="0" stopColor="#151c26" />
              <stop offset="1" stopColor="#0a0e13" />
            </radialGradient>
            <radialGradient id="sc-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0.55" stopColor="#f44e04" stopOpacity="0" />
              <stop offset="0.8" stopColor="#f44e04" stopOpacity="0.06" />
              <stop offset="1" stopColor="#f44e04" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sc-open" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff7a3d" />
              <stop offset="1" stopColor="#f44e04" />
            </linearGradient>
            {(() => {
              const [x1, y1] = polar(R_CORE, nowH);
              const [x2, y2] = polar(R_OUT, nowH);
              return (
                <linearGradient id="sc-needle" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                  <stop offset="0" stopColor="#e9eef3" stopOpacity="0.15" />
                  <stop offset="0.7" stopColor="#e9eef3" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#f44e04" />
                </linearGradient>
              );
            })()}
            <filter id="sc-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={C} cy={C} r={C - 2} fill="url(#sc-halo)" />
          <circle cx={C} cy={C} r={R_OUT} fill="none" stroke="var(--line)" />
          <circle cx={C} cy={C} r={R_OUT - 44} fill="none" stroke="var(--line)" strokeOpacity={0.6} />

          {/* 15-minute ticks, hour ticks, 3-hour labels */}
          {Array.from({ length: 96 }, (_, q) => {
            const h = q / 4;
            const major = q % 12 === 0;
            const hour = q % 4 === 0;
            const [x1, y1] = polar(R_OUT, h);
            const [x2, y2] = polar(R_OUT - (major ? 16 : hour ? 10 : 5), h);
            return (
              <line
                key={q}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={major ? "var(--text)" : "var(--muted)"}
                strokeOpacity={major ? 0.9 : hour ? 0.55 : 0.22}
                strokeWidth={major ? 1.5 : 1}
              />
            );
          })}
          {Array.from({ length: 8 }, (_, k) => {
            const h = k * 3;
            const [x, y] = polar(R_OUT - 30, h);
            return (
              <text key={h} x={x} y={y} fill={h % 6 === 0 ? "var(--text)" : "var(--muted)"} fontSize={12} textAnchor="middle" dominantBaseline="central" className="mono">
                {String(h).padStart(2, "0")}
              </text>
            );
          })}

          {/* session tracks */}
          {HOURS.map((range, i) => {
            const r = TRACK0 - i * TRACK_GAP;
            const open = openFlags[i];
            const [lx, ly] = polar(r, range[0]);
            return (
              <g key={names[i]}>
                <circle cx={C} cy={C} r={r} fill="none" stroke="var(--line)" strokeWidth={9} strokeOpacity={0.45} />
                <path
                  d={arc(r, range[0], range[1])}
                  fill="none"
                  stroke={open ? "url(#sc-open)" : "var(--muted)"}
                  strokeOpacity={open ? 1 : 0.38}
                  strokeWidth={9}
                  strokeLinecap="round"
                  filter={open ? "url(#sc-glow)" : undefined}
                />
                <circle cx={lx} cy={ly} r={2} fill={open ? "#fff" : "var(--muted)"} />
              </g>
            );
          })}

          {/* needle */}
          {mins !== null
            ? (() => {
                const [x, y] = polar(R_OUT + 2, nowH);
                const [bx, by] = polar(R_CORE + 4, nowH);
                return (
                  <g>
                    <line x1={bx} y1={by} x2={x} y2={y} stroke="url(#sc-needle)" strokeWidth={1.75} strokeLinecap="round" />
                    <circle cx={x} cy={y} r={5} fill="var(--accent)" filter="url(#sc-glow)" />
                  </g>
                );
              })()
            : null}

          {/* core readout */}
          <circle cx={C} cy={C} r={R_CORE} fill="url(#sc-core)" stroke="var(--line)" />
          <text x={C} y={C - 8} textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize={44} className="font-display">
            {nowText}
          </text>
          <text x={C} y={C + 28} textAnchor="middle" dominantBaseline="central" fill="var(--muted)" fontSize={11} letterSpacing="0.14em" className="mono">
            {tz}
            {mins !== null ? ` · ${ui.openNow.toUpperCase()} ${openCount}` : ""}
          </text>
        </svg>
      </div>
    </div>
  );
}
