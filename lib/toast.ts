export const TOAST_EVENT = "mi-ruta:toast";

export function showToast(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}
