import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PressLink } from "@/components/medai/PressLink";
import { motion, useScroll, AnimatePresence } from "motion/react";
import { Menu, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analyze", label: "Analyze" },
  { to: "/reports", label: "Reports" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 40)), [scrollY]);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        layout
        className={cn(
          "glass-strong pointer-events-auto flex items-center gap-1.5 rounded-full transition-all duration-500 shadow-sm border border-border/80",
          scrolled ? "bg-white/95 px-3 py-2 shadow-glass-float" : "px-4 py-2.5 bg-white/80",
        )}
        animate={{ scale: scrolled ? 0.97 : 1, y: scrolled ? -2 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        <Link to="/" className="mr-2 flex items-center gap-2.5 pl-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-[0_2px_10px_rgba(37,99,235,0.35)]">
            <span className="flex gap-[3px]">
              <span className="h-[7px] w-[3px] rounded-full bg-white" />
              <span className="h-[7px] w-[3px] rounded-full bg-white" />
            </span>
          </span>
          <span className="text-[15px] font-bold tracking-tight text-foreground">Samjho Health</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-softblue/60"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Real-time Hardware / Engine Status Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-paleblue text-[11px] font-mono font-medium text-primary border border-primary/10 ml-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemma 4 12B • EvidenceTrace™</span>
        </div>

        <div className="hidden sm:block">
          <PressLink
            to="/analyze"
            search={{ sample: false }}
            className="ml-1 rounded-full bg-primary px-4 py-1.5 text-[13px] font-semibold text-white shadow-[0_2px_12px_rgba(37,99,235,0.3)] hover:bg-bright transition-colors"
          >
            Analyze a Report
          </PressLink>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground sm:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="glass-strong pointer-events-auto fixed inset-x-4 top-20 flex flex-col gap-2 rounded-3xl p-5 shadow-2xl sm:hidden border border-border bg-white"
          >
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                  pathname === link.to ? "bg-softblue text-primary" : "text-foreground hover:bg-paleblue",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-2 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemma 4 12B
              </span>
              <span>EvidenceTrace™ 0ms</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
