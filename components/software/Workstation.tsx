"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { bandsUi, softwareUi as ui } from "@/content/copy";
import SimLabel from "@/components/ui/SimLabel";
import { clock, fmt, useWorkstation } from "./data";
import { IconCheck, IconMark, IconSearch, IconSettings, NAV_ICONS } from "./icons";
import { Alerts, KpiCard, ModelStatus, OrderTicket, PriceChart, Watchlist, kpis } from "./widgets";

const MODULES = 6;
/** Where each module flies in from before it springs into its grid slot. */
const SCATTER = [
  { x: -46, y: -38, s: 0.94 },
  { x: -70, y: 30, s: 0.95 },
  { x: 72, y: -26, s: 0.93 },
  { x: -40, y: 64, s: 0.93 },
  { x: 30, y: 70, s: 0.92 },
  { x: 84, y: 52, s: 0.92 },
];

type SlotProps = {
  i: number;
  launched: boolean;
  locked: boolean;
  reduce: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A grid slot: a faint blueprint outline that a module flies into and locks onto. */
function Slot({ i, launched, locked, reduce, className = "", children }: SlotProps) {
  const from = SCATTER[i];
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 rounded-[10px] border border-dashed border-[rgba(233,238,243,0.1)] transition-opacity duration-500 ${locked ? "opacity-0" : "opacity-100"}`}
      >
        <span className="mono absolute left-2 top-1.5 text-[9px] uppercase tracking-[0.14em] text-muted/40">
          {String(i + 1).padStart(2, "0")}
        </span>
      </div>
      <motion.div
        className="relative h-full"
        initial={reduce ? false : { opacity: 0, x: from.x, y: from.y, scale: from.s, filter: "blur(6px)" }}
        animate={
          launched || reduce
            ? { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, x: from.x, y: from.y, scale: from.s, filter: "blur(6px)" }
        }
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 24, mass: 0.8, opacity: { duration: 0.3 }, filter: { duration: 0.35 } }
        }
      >
        {children}
        {/* lock flash: accent edge glow */}
        {!reduce ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[10px] shadow-[inset_0_0_0_1px_rgba(244,78,4,0.75),0_0_24px_-4px_rgba(244,78,4,0.55)]"
            initial={{ opacity: 0 }}
            animate={locked ? { opacity: [0, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.15, 1], ease: "easeOut" }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}

export default function Workstation() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const visible = useInView(ref, { amount: 0.1 });
  const [launched, setLaunched] = useState(0);
  const [locked, setLocked] = useState<boolean[]>(() => Array(MODULES).fill(false));

  // staggered launch, one module at a time; each locks ~0.5s after it starts flying
  useEffect(() => {
    if (reduce || !seen) return;
    const ids: number[] = [];
    for (let i = 0; i < MODULES; i++) {
      const at = 250 + i * 200;
      ids.push(window.setTimeout(() => setLaunched((n) => Math.max(n, i + 1)), at));
      ids.push(window.setTimeout(() => setLocked((l) => l.map((v, j) => (j === i ? true : v))), at + 480));
    }
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [seen, reduce]);

  const lockedCount = reduce ? MODULES : locked.filter(Boolean).length;
  const gridLocked = lockedCount === MODULES;

  const { t, ticker } = useWorkstation(gridLocked && visible && !reduce);
  const isLocked = (i: number) => reduce || locked[i];

  // whole-window perspective tilt that flattens as the band scrolls into place
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const tiltRaw = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 14, 0]);
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.94, 1]);
  const rotateX = useSpring(tiltRaw, { stiffness: 120, damping: 24 });
  const scale = useSpring(scaleRaw, { stiffness: 120, damping: 24 });

  const slot = (i: number) => ({ i, launched: launched > i, locked: isLocked(i), reduce });
  const k = kpis(t, ticker.latencyMs);

  return (
    <figure aria-label={ui.ariaLabel} className="relative m-0" style={{ perspective: 2000 }}>
      <motion.div
        ref={ref}
        style={{ rotateX, scale, transformOrigin: "50% 0%" }}
        className="relative overflow-hidden rounded-[14px] border border-[rgba(233,238,243,0.1)] bg-[#080b10] shadow-[0_0_0_1px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06),0_50px_120px_-30px_rgba(0,0,0,0.9),0_30px_90px_-40px_rgba(244,78,4,0.18)]"
      >
        {/* top highlight */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />

        <div aria-hidden="true">
          {/* ---------- title bar ---------- */}
          <div className="flex h-10 items-center gap-3 border-b border-[rgba(233,238,243,0.07)] bg-[rgba(255,255,255,0.015)] px-3.5">
            <span className="flex gap-[6px]">
              {[0, 1, 2].map((d) => (
                <i key={d} className="block h-[9px] w-[9px] rounded-full bg-[rgba(233,238,243,0.12)] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.08)]" />
              ))}
            </span>
            <span className="ml-1 flex shrink-0 items-center gap-1.5 text-[11.5px]">
              <span className="font-medium text-text">{ui.appName}</span>
              <span className="text-muted/50">/</span>
              <span className="truncate text-muted">{ui.view}</span>
            </span>
            <span className="mx-auto hidden h-[24px] w-[34%] max-w-[230px] items-center gap-2 rounded-[6px] border border-[rgba(233,238,243,0.07)] bg-black/30 px-2 text-[10.5px] text-muted/70 md:flex">
              <IconSearch className="h-3 w-3 shrink-0" />
              <span className="truncate">{ui.search}</span>
              <span className="mono ml-auto shrink-0 rounded-[4px] border border-[rgba(233,238,243,0.1)] px-1 text-[9.5px] leading-[14px] text-muted">{ui.kbd}</span>
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
              <span
                className={`mono flex h-[22px] items-center gap-1.5 rounded-full border px-2 text-[9.5px] uppercase tracking-[0.1em] transition-colors duration-500 ${
                  gridLocked ? "border-signal/30 bg-signal/[0.07] text-signal" : "border-[rgba(233,238,243,0.1)] text-muted"
                }`}
              >
                {gridLocked ? (
                  <IconCheck className="h-3 w-3" />
                ) : (
                  <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-accent" />
                )}
                <span className="tabular-nums">{gridLocked ? bandsUi.software.locked : `${bandsUi.software.modules} ${lockedCount} / ${MODULES}`}</span>
              </span>
              <span className="mono hidden h-[22px] items-center gap-1.5 rounded-full border border-[rgba(233,238,243,0.1)] px-2 text-[9.5px] text-muted sm:flex">
                <span className="live-dot !h-[5px] !w-[5px]" />
                <span className="uppercase tracking-[0.1em] text-text/80">{ui.live}</span>
                <span className="tabular-nums">{clock(t)}</span>
              </span>
            </span>
          </div>

          <div className="flex">
            {/* ---------- sidebar ---------- */}
            <nav className="hidden w-11 shrink-0 flex-col items-center gap-1 border-r border-[rgba(233,238,243,0.06)] bg-[rgba(255,255,255,0.01)] py-2.5 md:flex">
              <span className="mb-2 grid h-7 w-7 place-items-center rounded-[7px] bg-[linear-gradient(180deg,rgba(244,78,4,0.22),rgba(244,78,4,0.08))] text-accent shadow-[inset_0_0_0_1px_rgba(244,78,4,0.35)]">
                <IconMark className="h-3.5 w-3.5" />
              </span>
              {NAV_ICONS.map((Icon, i) => (
                <span
                  key={ui.nav[i]}
                  title={ui.nav[i]}
                  className={`relative grid h-7 w-7 place-items-center rounded-[7px] ${i === 0 ? "bg-[rgba(233,238,243,0.07)] text-text" : "text-muted/60"}`}
                >
                  {i === 0 ? <span className="absolute -left-[9px] top-1.5 h-4 w-[2px] rounded-full bg-accent" /> : null}
                  {i === 3 ? <span className="absolute right-1 top-1 h-[5px] w-[5px] rounded-full bg-risk ring-2 ring-[#080b10]" /> : null}
                  <Icon className="h-[15px] w-[15px]" />
                </span>
              ))}
              <span className="mt-auto grid h-7 w-7 place-items-center text-muted/60" title={ui.nav[5]}>
                <IconSettings className="h-[15px] w-[15px]" />
              </span>
            </nav>

            {/* ---------- module grid ---------- */}
            <div className="relative min-w-0 flex-1 p-2.5">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_40%_0%,rgba(51,209,180,0.04),transparent_70%)]" />
              {/* one accent scan sweeps the grid the moment it locks */}
              {gridLocked && !reduce ? (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-10 h-28 bg-[linear-gradient(180deg,transparent,rgba(244,78,4,0.07)_70%,rgba(244,78,4,0.35)_99%,transparent)]"
                  initial={{ top: "-30%", opacity: 1 }}
                  animate={{ top: "105%", opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], opacity: { duration: 1.1, ease: "easeIn" } }}
                />
              ) : null}
              <div className="relative grid grid-cols-1 gap-2 md:grid-cols-12">
                <Slot {...slot(0)} className="md:col-span-12">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {k.map((kk) => (
                      <KpiCard key={kk.label} k={kk} />
                    ))}
                  </div>
                </Slot>
                <Slot {...slot(1)} className="h-[230px] md:col-span-8 md:h-[258px]">
                  <PriceChart t={t} />
                </Slot>
                <Slot {...slot(2)} className="md:col-span-4 md:h-[258px]">
                  <OrderTicket ticker={ticker} t={t} />
                </Slot>
                <Slot {...slot(3)} className="hidden md:col-span-5 md:block">
                  <Watchlist ticker={ticker} />
                </Slot>
                <Slot {...slot(4)} className="hidden md:col-span-4 md:block">
                  <Alerts t={t} />
                </Slot>
                <Slot {...slot(5)} className="hidden md:col-span-3 md:block">
                  <ModelStatus t={t} running={gridLocked && visible && !reduce} />
                </Slot>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- status bar ---------- */}
        <div className="flex h-7 items-center justify-between gap-3 border-t border-[rgba(233,238,243,0.07)] bg-[rgba(255,255,255,0.015)] px-3.5">
          <SimLabel className="!text-[9.5px] [&>span:first-child]:!mt-[3px]" />
          <span aria-hidden="true" className="mono hidden items-center gap-3 text-[9.5px] text-muted/80 sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-signal" />
              {ui.status.feed}
            </span>
            <span className="tabular-nums">
              {fmt(ticker.ticksPerSec, 0)} {ui.status.ticks}
            </span>
            <span className="tabular-nums">
              {fmt(ticker.latencyMs, 1)} {ui.status.ms}
            </span>
          </span>
        </div>
      </motion.div>
    </figure>
  );
}
