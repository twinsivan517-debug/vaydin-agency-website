"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type Bus = { p: number; subs: Set<(p: number) => void> };

const SceneBus = createContext<Bus | null>(null);

export function useSceneProgress(fn: (p: number) => void) {
  const bus = useContext(SceneBus);
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => {
    if (!bus) return;
    const call = (p: number) => latest.current(p);
    bus.subs.add(call);
    call(bus.p);
    return () => {
      bus.subs.delete(call);
    };
  }, [bus]);
}

export function Scene({
  id,
  length,
  label,
  children,
}: {
  id: string;
  length: number;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [bus] = useState<Bus>(() => ({ p: 0, subs: new Set() }));

  useEffect(() => {
    const el = ref.current;
    const pin = el?.firstElementChild as HTMLElement | null;
    if (!el || !pin) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const span = el.offsetHeight - pin.offsetHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span)) : 0;
      if (p === bus.p) return;
      bus.p = p;
      el.style.setProperty("--p", p.toFixed(4));
      bus.subs.forEach((fn) => fn(p));
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        addEventListener("scroll", tick, { passive: true });
        addEventListener("resize", tick);
        tick();
      } else {
        removeEventListener("scroll", tick);
        removeEventListener("resize", tick);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      removeEventListener("scroll", tick);
      removeEventListener("resize", tick);
      cancelAnimationFrame(raf);
    };
  }, [bus]);

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className="scene"
      style={{ "--len": length } as CSSProperties}
    >
      <div className="scene-pin">
        <SceneBus.Provider value={bus}>{children}</SceneBus.Provider>
      </div>
    </section>
  );
}
