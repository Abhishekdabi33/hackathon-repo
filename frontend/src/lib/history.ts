import type { SavedReport } from "@/types/report";

const KEY = "medai:reports";

export function loadReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedReport[]) : [];
  } catch {
    return [];
  }
}

export function saveReport(report: SavedReport): SavedReport[] {
  const next = [report, ...loadReports()].slice(0, 30);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — history is best-effort.
  }
  return next;
}

export function clearReports() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
