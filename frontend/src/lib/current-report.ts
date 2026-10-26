import type { Analysis } from "@/types/report";

const KEY = "medai:current";

/** The report the chat assistant talks about. Kept per browser session. */
export function setCurrentReport(analysis: Analysis, fileName: string) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ analysis, fileName }));
  } catch {
    // ignore
  }
}

export function getCurrentReport(): { analysis: Analysis; fileName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
