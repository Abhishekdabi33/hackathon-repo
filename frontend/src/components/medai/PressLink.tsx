import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";

type Ripple = { id: number; x: number; y: number };

type PressLinkProps = {
  to: string;
  search?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
};

/**
 * TanStack Link wrapped in spring press physics with a ripple bloom
 * from the click point. Keeps the link's own hover styling intact.
 */
export function PressLink({ to, search, className, children }: PressLinkProps) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const spawn = (e: MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = ++idRef.current;
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 700);
  };

  const press = reduced
    ? {}
    : { whileHover: { scale: 1.04 }, whileTap: { scale: 0.92 } };

  return (
    <motion.span
      ref={wrapRef}
      onPointerDown={spawn}
      {...press}
      transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
      className="relative inline-flex overflow-hidden rounded-full align-middle"
    >
      <Link to={to} search={search as never} className={className}>
        {children}
      </Link>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: r.x,
            top: r.y,
            background: className?.includes("bg-primary")
              ? "rgba(255,255,255,0.55)"
              : "rgba(37,99,235,0.22)",
          }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 30, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      ))}
    </motion.span>
  );
}
