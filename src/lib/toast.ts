export type ToastKind = 'info' | 'error';
export type ToastItem = { id: number; message: string; kind: ToastKind };

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * Show a non-blocking notification. This replaces the native alert() dialogs
 * the editor and its tools used for every error and confirmation.
 */
export function toast(message: string, kind: ToastKind = 'info'): void {
  const item: ToastItem = { id: ++seq, message, kind };
  items = [...items.slice(-3), item];
  emit();
  setTimeout(() => {
    items = items.filter((entry) => entry.id !== item.id);
    emit();
  }, 6000);
}

export function dismissToast(id: number): void {
  items = items.filter((entry) => entry.id !== id);
  emit();
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): ToastItem[] {
  return items;
}
