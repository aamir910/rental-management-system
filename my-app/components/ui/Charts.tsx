"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedCounter({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toString();
      }
    });
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

export function FakeBarChart({
  data,
  className = "",
}: {
  data: { label: string; income: number; expense: number }[];
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={`flex h-36 items-end gap-2 sm:gap-3 ${className}`}>
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div className="flex w-full flex-1 items-end justify-center gap-0.5">
            <motion.div
              className="w-[45%] rounded-t-sm bg-emerald/80"
              initial={{ height: 0 }}
              animate={inView ? { height: `${d.income}%` } : {}}
              transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
            />
            <motion.div
              className="w-[45%] rounded-t-sm bg-violet/70"
              initial={{ height: 0 }}
              animate={inView ? { height: `${d.expense}%` } : {}}
              transition={{ duration: 0.7, delay: i * 0.06 + 0.05, ease: "easeOut" }}
            />
          </div>
          <span className="shrink-0 text-[10px] text-gray-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function FakeSimpleBars({
  data,
  color = "violet",
  className = "",
}: {
  data: { month: string; value: number }[];
  color?: "violet" | "emerald" | "amber";
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const colorClass =
    color === "emerald"
      ? "bg-emerald"
      : color === "amber"
        ? "bg-amber"
        : "bg-violet";

  return (
    <div ref={ref} className={`flex h-32 items-end gap-2 ${className}`}>
      {data.map((d, i) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
          <motion.div
            className={`w-full rounded-t-md ${colorClass}`}
            initial={{ height: 0 }}
            animate={inView ? { height: `${d.value}%` } : {}}
            transition={{ duration: 0.65, delay: i * 0.07, ease: "easeOut" }}
            style={{ minHeight: inView ? undefined : 0 }}
          />
          <span className="text-[10px] text-gray-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
