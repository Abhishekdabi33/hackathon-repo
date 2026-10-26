/**
 * Hands a picked file from the dashboard to the analyze page across a
 * client-side navigation. Only ever holds one in-memory File reference.
 */
let pending: File | null = null;

export function setPendingFile(f: File | null) {
  pending = f;
}

export function takePendingFile() {
  const f = pending;
  pending = null;
  return f;
}
