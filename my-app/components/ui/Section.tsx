"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: "dark" | "light" | "mid";
};

export function Section({
  id,
  children,
  className = "",
  variant = "dark",
}: SectionProps) {
  const variantClass =
    variant === "light"
      ? "section-light"
      : variant === "mid"
        ? "section-mid"
        : "section-dark";

  return (
    <section id={id} className={`relative py-20 md:py-28 ${variantClass} ${className}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  children,
  light = false,
  className = "",
}: {
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl ${
        light ? "text-white" : "text-ink"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-violet-soft ${className}`}
    >
      {children}
    </span>
  );
}

export function GlassCard({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 ${light ? "glass-light" : "glass"} ${className}`}>
      {children}
    </div>
  );
}
