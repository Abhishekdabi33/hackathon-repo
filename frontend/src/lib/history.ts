import type { SavedReport } from "@/types/report";

const KEY = "medai:reports";

/**
 * Deduplicate reports by checking unique signature (fileName + reportTitle / summary excerpt).
 * Retains the newest report entry if duplicates exist.
 */
export function deduplicateReports(reports: SavedReport[]): SavedReport[] {
  if (!Array.isArray(reports)) return [];
  const seenSigs = new Set<string>();
  const seenIds = new Set<string>();
  const unique: SavedReport[] = [];

  for (const r of reports) {
    if (!r || !r.analysis) continue;

    // Check unique ID
    if (r.id && seenIds.has(r.id)) continue;

    const fileKey = (r.fileName || "").trim().toLowerCase();
    const titleKey = (r.analysis.reportTitle || "").trim().toLowerCase();
    const summaryExcerpt = (r.analysis.summary || "").slice(0, 90).trim().toLowerCase();

    // Unique signature key combining fileName and report title/summary
    const sig = fileKey
      ? `${fileKey}::${titleKey || summaryExcerpt}`
      : `${titleKey}::${summaryExcerpt}`;

    if (!seenSigs.has(sig)) {
      seenSigs.add(sig);
      if (r.id) seenIds.add(r.id);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Load all saved reports from localStorage, automatically healing and deduplicating records.
 */
export function loadReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deduplicated = deduplicateReports(parsed as SavedReport[]);

    // If duplicates were purged, heal localStorage silently
    if (deduplicated.length !== parsed.length) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(deduplicated));
      } catch {
        // ignore quota errors
      }
    }

    return deduplicated;
  } catch {
    return [];
  }
}

/**
 * Save a report, replacing any existing duplicate or older version of the same report.
 */
export function saveReport(report: SavedReport): SavedReport[] {
  if (!report || !report.analysis) return loadReports();

  const current = loadReports();

  const fileKey = (report.fileName || "").trim().toLowerCase();
  const titleKey = (report.analysis?.reportTitle || "").trim().toLowerCase();
  const summaryExcerpt = (report.analysis?.summary || "").slice(0, 90).trim().toLowerCase();
  const newSig = fileKey
    ? `${fileKey}::${titleKey || summaryExcerpt}`
    : `${titleKey}::${summaryExcerpt}`;

  // Filter out any prior entry matching this ID or signature
  const filtered = current.filter((r) => {
    if (!r) return false;
    if (r.id === report.id) return false;

    const rFile = (r.fileName || "").trim().toLowerCase();
    const rTitle = (r.analysis?.reportTitle || "").trim().toLowerCase();
    const rSummary = (r.analysis?.summary || "").slice(0, 90).trim().toLowerCase();
    const rSig = rFile ? `${rFile}::${rTitle || rSummary}` : `${rTitle}::${rSummary}`;

    return rSig !== newSig;
  });

  const next = [report, ...filtered].slice(0, 30);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — history is best-effort.
  }
  return next;
}

/**
 * Delete a specific report by ID.
 */
export function deleteReport(id: string): SavedReport[] {
  const current = loadReports();
  const next = current.filter((r) => r.id !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

/**
 * Clear all stored reports from history.
 */
export function clearReports() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
