import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Ripple = { id: number; x: number; y: number };

type PressButtonProps = {
  variant?: "primary" | "outline" | "glass";
  className?: string;
  children: ReactNode;
  disabled?: boolean | undefined;
  type?: "button" | "submit";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Button with buttery press physics — spring hover/tap scales plus a
 * ripple burst that blooms from the exact click point.
 */
export function PressButton({
  className,
  variant = "primary",
  onClick,
  children,
  disabled,
  type = "button",
}: PressButtonProps) {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++idRef.current;
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 700);
    onClick?.(e);
  };

  const variantClass = {
    primary:
      "bg-primary text-primary-foreground shadow-[0_8px_30px_rgba(37,99,235,0.3)] hover:bg-bright",
    outline:
      "border border-border text-muted-foreground hover:border-bright/40 hover:text-foreground",
    glass: "glass text-foreground/90 hover:bg-paleblue",
  }[variant];

  const press = reduced
    ? {}
    : { whileHover: { scale: 1.035 }, whileTap: { scale: 0.9 } };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      {...press}
      transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden rounded-full font-semibold transition-colors",
        variantClass,
        className,
      )}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: r.x,
            top: r.y,
            background:
              variant === "primary" ? "rgba(255,255,255,0.55)" : "rgba(37,99,235,0.22)",
          }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 30, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      ))}
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
