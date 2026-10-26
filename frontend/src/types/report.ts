export type Finding = {
  term: string;
  explanation: string;
  importance: "normal" | "attention" | "outside_range";
  value: string | null;
  deepDive: {
    meaning: string;
    whyItMatters: string;
    yourResult: string | null;
    typicalRange: string | null;
  } | null;
};

export type LabValue = {
  name: string;
  value: string;
  unit: string | null;
  reference: string | null;
  status: "normal" | "attention" | "outside_range";
};

export type EvidenceTraceItem = {
  test_name: string;
  standard_key?: string;
  measured_value: number | string;
  unit: string;
  stated_range: string;
  status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL" | string;
  is_abnormal: boolean;
  clinical_significance: string;
  source_line: string;
  suggested_questions: string[];
};

export type Analysis = {
  reportTitle: string;
  summary: string;
  findings: Finding[];
  values: LabValue[];
  abbreviations: { abbr: string; meaning: string }[];
  evidence_trace?: EvidenceTraceItem[];
  doctor_questions?: string[];
  abnormal_count?: number;
  total_tests?: number;
  model_used?: string;
  latency_ms?: number;
};

export type SavedReport = {
  id: string;
  createdAt: string;
  fileName: string;
  analysis: Analysis;
};

export type ClinicalSample = {
  id: string;
  title: string;
  type: string;
  filename: string;
  description: string;
  content: string;
};

export function statusLabel(status: "normal" | "attention" | "outside_range" | string): string {
  const s = String(status || "").toLowerCase();
  if (s === "normal") return "Normal";
  if (s === "attention" || s === "high" || s === "low") return "Attention";
  if (s === "outside_range" || s === "critical") return "Outside range";
  return status;
}
