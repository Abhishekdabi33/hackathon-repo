export const API_BASE = (import.meta.env.VITE_API_URL || "https://lablens-ai-backend.onrender.com").replace(/\/$/, "");

export type ReportInput = {
  reportText?: string;
  imageDataUrl?: string;
  fileName?: string;
};

const MAX_TEXT = 32000;

/** Downscale an image and return a JPEG data URL so uploads stay small. */
async function imageToDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = url;
    });
    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Read plain text / markdown / csv file */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read text file"));
    reader.readAsText(file);
  });
}

/**
 * Universal file converter supporting PDF, Images, Text, and CSV files.
 * Uses backend /api/upload with PyMuPDF/RapidOCR when available.
 */
export async function fileToReportInput(file: File): Promise<ReportInput> {
  const type = file.type || "";
  const name = file.name.toLowerCase();

  // Try backend extraction first if available
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return {
        reportText: data.content || data.preview || "",
        imageDataUrl: data.image_base64 ? `data:image/jpeg;base64,${data.image_base64}` : undefined,
        fileName: file.name,
      };
    }
  } catch (err) {
    console.warn("Backend /api/upload unavailable, falling back to local processing:", err);
  }

  // Local fallback processing
  if (name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".json") || name.endsWith(".md")) {
    const text = await readTextFile(file);
    return { reportText: text.slice(0, MAX_TEXT), fileName: file.name };
  }

  if (type.startsWith("image/") || /\.(png|jpe?g|webp|heic)$/.test(name)) {
    const dataUrl = await imageToDataUrl(file);
    return { imageDataUrl: dataUrl, fileName: file.name };
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    throw new Error("Unable to parse PDF on backend. Please ensure the backend is available or upload a PNG/JPEG image of the report.");
  }

  if (type.startsWith("video/") || /\.(mp4|mov|webm|avi)$/i.test(name)) {
    throw new Error("Video received. Please ensure the backend is running so OpenCV can sample keyframes and extract clinical readings.");
  }

  // Default to text read
  const text = await readTextFile(file);
  return { reportText: text.slice(0, MAX_TEXT), fileName: file.name };
}
